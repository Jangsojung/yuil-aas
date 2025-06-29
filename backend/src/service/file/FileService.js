import { pool } from '../../index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAASXFilesFromDB = async (af_kind = 3, fc_idx = 3, startDate = null, endDate = null) => {
  return new Promise((resolve, reject) => {
    let query = 'select af_idx, af_name, createdAt from tb_aasx_file where af_kind = ? and fc_idx = ?';

    const queryParams = [af_kind, fc_idx];

    if (startDate && endDate) {
      const startDateTime = `${startDate} 00:00:00`;
      const endDateTime = `${endDate} 23:59:59`;
      query += ' and createdAt between ? and ?';
      queryParams.push(startDateTime, endDateTime);
    }

    query += ' order by af_idx desc';

    pool.query(query, queryParams, (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
          return;
        }

        const files = results.map((file) => {
          return {
            af_idx: file.af_idx,
            af_name: file.af_name,
            createdAt: file.createdAt,
          };
        });

        resolve(files);
      }
    });
  });
};

export const insertAASXFileToDB = async (fc_idx, fileName, user_idx) => {
  try {
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

    console.log('AAS JSON 파일 생성 및 DB 저장 완료');

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

    console.log('AASX 파일 생성 및 DB 저장 완료');

    return {
      success: true,
      fileName: aasxFileName,
      filePath: '/files/aasx',
      af_idx: result.insertId,
      message: '변환 완료: AAS JSON, AASX 파일이 모두 생성되었습니다.',
    };
  } catch (err) {
    console.log('Failed to insert AASX File: ', err);
    throw err;
  }
};

export const updateAASXFileToDB = async (af_idx, fileName, user_idx) => {
  try {
    const [aasxRows] = await pool
      .promise()
      .query('SELECT af_name FROM tb_aasx_file WHERE af_idx = ? AND af_kind = 3', [af_idx]);

    if (aasxRows.length === 0) {
      throw new Error('수정할 AASX 파일을 찾을 수 없습니다.');
    }

    const oldAasxFileName = aasxRows[0].af_name;
    const oldAasFileName = oldAasxFileName.replace(/\.aasx$/i, '.json');
    const newAasFileName = fileName;
    const newAasxFileName = fileName.replace(/\.json$/i, '.aasx');

    console.log('기존 파일명:', oldAasxFileName, '새 파일명:', newAasxFileName);

    const oldAasPath = `../files/aas/${oldAasFileName}`;
    const oldAasxPath = `../files/aasx/${oldAasxFileName}`;

    console.log('삭제할 파일 경로:', oldAasPath, oldAasxPath);

    const deleteResponse = await fetch(`${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}/api/aas`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paths: [oldAasPath, oldAasxPath],
      }),
    });

    console.log('삭제 응답 상태:', deleteResponse.status, deleteResponse.statusText);

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.log('기존 파일 삭제 중 오류 발생:', errorText);
    } else {
      const responseText = await deleteResponse.text();
      console.log('기존 파일 삭제 완료:', responseText);
    }

    const [existingAasRows] = await pool
      .promise()
      .query('SELECT af_idx FROM tb_aasx_file WHERE af_name = ? AND af_kind = 2', [oldAasFileName]);

    if (existingAasRows.length > 0) {
      const updateAasQuery = `UPDATE tb_aasx_file SET af_name = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP WHERE af_name = ? AND af_kind = 2`;
      await pool.promise().query(updateAasQuery, [newAasFileName, user_idx, oldAasFileName]);
      console.log('기존 AAS 파일 DB 레코드 업데이트 완료');
    } else {
      const insertAasQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, 2, ?, '/files/aas', ?, ?)`;
      await pool.promise().query(insertAasQuery, [3, newAasFileName, user_idx, user_idx]);
      console.log('새 AAS 파일 DB 레코드 생성 완료');
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
    console.log('AASX 파일명 DB 업데이트 완료');

    console.log('AASX 파일 업데이트 및 DB 수정 완료');

    return {
      success: true,
      fileName: newAasxFileName,
      filePath: '/files/aasx',
      message: '변환 완료: AAS JSON, AASX 파일이 모두 업데이트되었습니다.',
    };
  } catch (err) {
    console.log('Failed to update AASX File: ', err);
    throw err;
  }
};

export const deleteAASXFilesFromDB = async (ids) => {
  try {
    const query = `select af_name from tb_aasx_file where af_idx in (?) and af_kind = 3`;
    const [results] = await pool.promise().query(query, [ids]);

    if (results.length === 0) {
      console.log('삭제할 AASX 파일이 없습니다.');
      return {
        success: true,
        message: '삭제할 AASX 파일이 없습니다.',
        deletedCount: 0,
      };
    }

    const aasxFileNames = results.map((row) => row.af_name);
    const aasFileNames = aasxFileNames.map((fileName) => fileName.replace(/\.aasx$/i, '.json'));

    const deleteAasxQuery = `delete from tb_aasx_file where af_idx in (?)`;
    await pool.promise().query(deleteAasxQuery, [ids]);

    const deleteAasQuery = `delete from tb_aasx_file where af_name in (?) and af_kind = 2`;
    await pool.promise().query(deleteAasQuery, [aasFileNames]);

    console.log('DB에서 AASX 및 AAS 파일 정보 삭제 완료');

    const deletePaths = [];

    aasxFileNames.forEach((fileName) => {
      deletePaths.push(`../files/aasx/${fileName}`);

      const aasFileName = fileName.replace(/\.aasx$/i, '.json');
      deletePaths.push(`../files/aas/${aasFileName}`);
    });

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
      console.log('Python 서버에서 파일 삭제 중 오류 발생');
    }

    console.log('AAS 및 AASX 파일 삭제 완료 (front 폴더 파일은 보존)');

    return {
      success: true,
      message: '파일이 성공적으로 삭제되었습니다. (front 폴더 파일은 보존됨)',
      deletedCount: results.length,
      deletedFiles: aasxFileNames,
    };
  } catch (err) {
    console.log('Failed to delete AASX Files: ', err);
    throw err;
  }
};

export const getVerifyFromDB = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.join(__dirname, '../../../../files/aas', file.af_name.replace(/\.aasx$/i, '.json'));

      fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err) {
          console.error('AASX 파일 읽기 오류:', err);
          reject(new Error('AASX 파일 읽기 실패'));
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
      console.error('AASX 파일 처리 오류:', error);
      reject(new Error('AASX 파일 처리 실패'));
    }
  });
};

export const getWordsFromDB = async (fc_idx) => {
  return new Promise((resolve, reject) => {
    const query = 'select as_kr, as_en from tb_aasx_alias order by as_idx desc';

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
