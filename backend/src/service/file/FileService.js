import { pool } from '../../index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getFilesFromDB = async (af_kind = 3, fc_idx = 3, startDate = null, endDate = null) => {
  return new Promise((resolve, reject) => {
    let query = '';
    const queryParams = [];

    // 공통 조건 쿼리
    const baseWhereClause = `f.af_kind = ? AND f.fc_idx = ?`;
    queryParams.push(af_kind, fc_idx);

    // 날짜 조건이 있다면 추가
    let dateClause = '';
    if (startDate && endDate) {
      dateClause = ` AND f.createdAt BETWEEN ? AND ?`;
      const startDateTime = `${startDate} 00:00:00`;
      const endDateTime = `${endDate} 23:59:59`;
      queryParams.push(startDateTime, endDateTime);
    }

    if (af_kind === 1) {
      // JSON 파일용 쿼리 (기초코드 정보 포함)
      query = `
        SELECT 
          f.af_idx, 
          f.af_name, 
          f.createdAt,
          f.updatedAt,
          b.ab_name AS base_name,
           COUNT(DISTINCT bs.sn_idx) AS sn_length
        FROM tb_aasx_file f
        LEFT JOIN tb_aasx_base b 
          ON b.ab_idx = CAST(SUBSTRING_INDEX(f.af_name, '-', 1) AS UNSIGNED)
        LEFT JOIN tb_aasx_base_sensor bs 
          ON bs.ab_idx = b.ab_idx
        WHERE ${baseWhereClause}
        ${dateClause}
        GROUP BY f.af_idx, f.af_name, f.createdAt, f.updatedAt, b.ab_name
        ORDER BY f.af_idx DESC
      `;
    } else {
      // 일반 AASX 파일용 쿼리
      query = `
        SELECT f.af_idx, f.af_name, f.createdAt, f.updatedAt
        FROM tb_aasx_file f
        WHERE ${baseWhereClause}
        ${dateClause}
        ORDER BY f.af_idx DESC
      `;
    }

    pool.query(query, queryParams, (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      if (results.length === 0) {
        resolve(null);
        return;
      }

      const files = results.map((file) => {
        if (af_kind === 1) {
          return {
            af_idx: file.af_idx,
            af_name: file.af_name,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            base_name: file.base_name || '삭제된 기초코드',
            sn_length: Number(file.sn_length) || 0,
          };
        } else {
          return {
            af_idx: file.af_idx,
            af_name: file.af_name,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
          };
        }
      });

      resolve(files);
    });
  });
};

export const insertAASXFileToDB = async (fc_idx, fileName, user_idx) => {
  try {
    // 파일명 중복 체크
    const [existing] = await pool
      .promise()
      .query('SELECT af_idx FROM tb_aasx_file WHERE af_name = ? AND (af_kind = 2 OR af_kind = 3)', [fileName]);
    if (existing.length > 0) {
      throw new Error('이미 생성되어있는 파일입니다.');
    }

    const frontFilePath = `../files/front/${fileName}`;

    const aasResponse = await fetch(`${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}/api/aas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: frontFilePath,
      }),
    });

    if (!aasResponse.ok) {
      throw new Error('AAS 파일 생성 중 오류가 발생했습니다.');
    }

    const aasFileName = fileName;
    const aasQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, 2, ?, '/files/aas', ?, ?)`;
    await pool.promise().query(aasQuery, [fc_idx, aasFileName, user_idx, user_idx]);

    const aasFilePath = `../files/aas/${fileName}`;
    const aasxResponse = await fetch(`${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}/api/aasx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: aasFilePath,
      }),
    });

    if (!aasxResponse.ok) {
      throw new Error('AASX 파일 생성 중 오류가 발생했습니다.');
    }

    const aasxFileName = fileName.replace(/\.json$/i, '.aasx');
    const aasxQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, 3, ?, '/files/aasx', ?, ?)`;
    const [result] = await pool.promise().query(aasxQuery, [fc_idx, aasxFileName, user_idx, user_idx]);

    return {
      success: true,
      fileName: aasxFileName,
      filePath: '/files/aasx',
      af_idx: result.insertId,
      message: '변환 완료: AAS JSON, AASX 파일이 모두 생성되었습니다.',
    };
  } catch (err) {
    console.error('Failed to insert AASX File: ', err);
    throw err;
  }
};

export const updateAASXFileToDB = async (af_idx, fileName, user_idx) => {
  try {
    // 새 파일명으로 이미 존재하는 파일이 있는지 체크
    const newAasxFileName = fileName.replace(/\.json$/i, '.aasx');
    const [existing] = await pool
      .promise()
      .query('SELECT af_idx FROM tb_aasx_file WHERE af_name = ? AND (af_kind = 2 OR af_kind = 3) AND af_idx != ?', [
        newAasxFileName,
        af_idx,
      ]);
    if (existing.length > 0) {
      throw new Error('이미 생성되어있는 파일입니다.');
    }

    const [aasxRows] = await pool
      .promise()
      .query('SELECT af_name FROM tb_aasx_file WHERE af_idx = ? AND af_kind = 3', [af_idx]);

    if (aasxRows.length === 0) {
      throw new Error('수정할 AASX 파일을 찾을 수 없습니다.');
    }

    const oldAasxFileName = aasxRows[0].af_name;
    const oldAasFileName = oldAasxFileName.replace(/\.aasx$/i, '.json');
    const newAasFileName = fileName;

    const oldAasPath = `../files/aas/${oldAasFileName}`;
    const oldAasxPath = `../files/aasx/${oldAasxFileName}`;

    const deleteResponse = await fetch(`${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}/api/aas`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paths: [oldAasPath, oldAasxPath],
      }),
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('기존 파일 삭제 중 오류 발생:', errorText);
    }

    const [existingAasRows] = await pool
      .promise()
      .query('SELECT af_idx FROM tb_aasx_file WHERE af_name = ? AND af_kind = 2', [oldAasFileName]);

    if (existingAasRows.length > 0) {
      const updateAasQuery = `UPDATE tb_aasx_file SET af_name = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP WHERE af_name = ? AND af_kind = 2`;
      await pool.promise().query(updateAasQuery, [newAasFileName, user_idx, oldAasFileName]);
    } else {
      const insertAasQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, 2, ?, '/files/aas', ?, ?)`;
      await pool.promise().query(insertAasQuery, [3, newAasFileName, user_idx, user_idx]);
    }

    const frontFilePath = `../files/front/${fileName}`;

    const aasResponse = await fetch(`${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}/api/aas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: frontFilePath,
      }),
    });

    if (!aasResponse.ok) {
      throw new Error('AAS 파일 생성 중 오류가 발생했습니다.');
    }

    const aasFilePath = `../files/aas/${fileName}`;
    const aasxResponse = await fetch(`${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}/api/aasx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: aasFilePath,
      }),
    });

    if (!aasxResponse.ok) {
      throw new Error('AASX 파일 생성 중 오류가 발생했습니다.');
    }

    const updateAasxQuery = `UPDATE tb_aasx_file SET af_name = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP WHERE af_idx = ?`;
    await pool.promise().query(updateAasxQuery, [newAasxFileName, user_idx, af_idx]);

    return {
      success: true,
      fileName: newAasxFileName,
      filePath: '/files/aasx',
      message: '변환 완료: AAS JSON, AASX 파일이 모두 업데이트되었습니다.',
    };
  } catch (err) {
    console.error('Failed to update AASX File: ', err);
    throw err;
  }
};

export const deleteFilesFromDB = async (ids) => {
  try {
    // 먼저 삭제할 파일들의 정보를 조회
    const query = `select af_idx, af_name, af_kind from tb_aasx_file where af_idx in (?)`;
    const [results] = await pool.promise().query(query, [ids]);

    if (results.length === 0) {
      return {
        success: true,
        message: '삭제할 파일이 없습니다.',
        deletedCount: 0,
      };
    }

    // af_kind별로 파일 분류
    const aasxFiles = results.filter((file) => file.af_kind === 3);
    const jsonFiles = results.filter((file) => file.af_kind === 1);

    const deletePaths = [];

    // AASX 파일 삭제 (af_kind = 3)
    if (aasxFiles.length > 0) {
      const aasxFileNames = aasxFiles.map((row) => row.af_name);
      const aasFileNames = aasxFileNames.map((fileName) => fileName.replace(/\.aasx$/i, '.json'));

      // AASX 파일 경로 추가
      aasxFileNames.forEach((fileName) => {
        deletePaths.push(`../files/aasx/${fileName}`);
        const aasFileName = fileName.replace(/\.aasx$/i, '.json');
        deletePaths.push(`../files/aas/${aasFileName}`);
      });

      // 관련 AAS 파일도 DB에서 삭제
      const deleteAasQuery = `delete from tb_aasx_file where af_name in (?) and af_kind = 2`;
      await pool.promise().query(deleteAasQuery, [aasFileNames]);
    }

    // JSON 파일 삭제 (af_kind = 1)
    if (jsonFiles.length > 0) {
      const jsonFileNames = jsonFiles.map((row) => row.af_name);
      jsonFileNames.forEach((fileName) => {
        deletePaths.push(`../files/front/${fileName}`);
      });
    }

    // DB에서 파일 정보 삭제
    const deleteQuery = `delete from tb_aasx_file where af_idx in (?)`;
    await pool.promise().query(deleteQuery, [ids]);

    // 실제 파일 삭제 (Python 서버 호출)
    if (deletePaths.length > 0) {
      const pythonResponse = await fetch(`${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}/api/aas`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paths: deletePaths,
        }),
      });

      if (!pythonResponse.ok) {
        console.error('Python 서버에서 파일 삭제 중 오류 발생');
      }
    }

    return {
      success: true,
      message: '파일이 성공적으로 삭제되었습니다.',
      deletedCount: results.length,
      deletedFiles: results.map((file) => file.af_name),
    };
  } catch (err) {
    console.error('Failed to delete Files: ', err);
    throw err;
  }
};

export const getVerifyFromDB = async (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      let af_path = file.af_path;
      let af_name = file.af_name;
      // af_path, af_name이 없으면 DB에서 조회
      if (!af_path || !af_name) {
        const [rows] = await pool
          .promise()
          .query('SELECT af_path, af_name FROM tb_aasx_file WHERE af_idx = ?', [file.af_idx]);
        if (!rows || rows.length === 0) {
          reject(new Error('DB에서 파일 정보를 찾을 수 없습니다.'));
          return;
        }
        af_path = rows[0].af_path;
        af_name = rows[0].af_name;
      }
      const filePath = path.join(__dirname, '../../../../', af_path, af_name);
      fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err) {
          console.error('JSON 파일 읽기 오류:', err);
          reject(new Error('JSON 파일 읽기 실패'));
          return;
        }
        try {
          const jsonData = JSON.parse(fileData);
          resolve(jsonData);
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          reject(new Error('JSON 파싱 실패'));
        }
      });
    } catch (error) {
      console.error('JSON 파일 처리 오류:', error);
      reject(new Error('JSON 파일 처리 실패'));
    }
  });
};

export const getWordsFromDB = async (fc_idx) => {
  return new Promise((resolve, reject) => {
    const query = 'select as_kr, as_en, createdAt, updatedAt from tb_aasx_alias order by as_idx desc';

    pool.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
          return;
        }

        const words = results.map((word) => {
          return {
            as_kr: word.as_kr,
            as_en: word.as_en,
            createdAt: word.createdAt,
            updatedAt: word.updatedAt,
          };
        });

        resolve(words);
      }
    });
  });
};

export const getSearchFromDB = async (fc_idx, type, text) => {
  return new Promise((resolve, reject) => {
    let column;
    if (type === 'kr') column = 'as_kr';
    else if (type === 'en') column = 'as_en';
    else return reject(new Error('Invalid type'));

    const query = `SELECT as_kr, as_en FROM tb_aasx_alias WHERE ${column} LIKE ? order by as_idx desc`;
    const searchText = `%${text}%`;

    pool.query(query, [searchText], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
          return;
        }

        const words = results.map((word) => {
          return {
            as_kr: word.as_kr,
            as_en: word.as_en,
          };
        });

        resolve(words);
      }
    });
  });
};

export const updateWordsToDB = async (updates) => {
  return new Promise((resolve, reject) => {
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      reject(new Error('업데이트할 데이터가 없습니다.'));
      return;
    }

    const updatePromises = updates.map((update) => {
      return new Promise((resolveUpdate, rejectUpdate) => {
        const { as_kr, original_as_en, new_as_en } = update;

        if (!as_kr || !original_as_en || !new_as_en) {
          rejectUpdate(new Error('필수 필드가 누락되었습니다.'));
          return;
        }

        const query = `UPDATE tb_aasx_alias SET as_en = ? WHERE as_kr = ? AND as_en = ?`;

        pool.query(query, [new_as_en, as_kr, original_as_en], (err, result) => {
          if (err) {
            rejectUpdate(err);
          } else {
            resolveUpdate({ as_kr, original_as_en, new_as_en, affectedRows: result.affectedRows });
          }
        });
      });
    });

    Promise.all(updatePromises)
      .then((results) => {
        resolve({
          success: true,
          updatedCount: results.length,
          results: results,
        });
      })
      .catch((error) => {
        console.error('단어 업데이트 실패:', error);
        reject(error);
      });
  });
};
