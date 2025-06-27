import { pool } from '../../index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const insertFileToDB = async (fc_idx, fileName, user_idx) => {
  try {
    const file_path = '/files/aas';

    const query = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, 2, ?, ?, ?, ?)`;
    const [result] = await pool.promise().query(query, [fc_idx, fileName, file_path, user_idx, user_idx]);

    console.log('JSON 파일 저장 및 DB 등록 완료');

    const pythonFilePath = `../files/front/${fileName}`;

    const pythonResponse = await fetch(`${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}/api/aas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: pythonFilePath,
      }),
    });

    return {
      success: true,
      fileName: fileName,
      filePath: file_path,
      af_idx: result.insertId,
    };
  } catch (err) {
    console.log('Failed to insert JSON File: ', err);
    throw err;
  }
};

export const updateFileToDB = async (af_idx, fileName, user_idx) => {
  try {
    const [rows] = await pool.promise().query('SELECT af_name FROM tb_aasx_file WHERE af_idx = ?', [af_idx]);

    if (!rows.length) {
      throw new Error('파일을 찾을 수 없습니다.');
    }

    const oldFileName = rows[0].af_name;
    const newFileName = fileName;

    const file_path = '/files/aas';
    const query = `UPDATE tb_aasx_file SET af_name = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP WHERE af_idx = ?`;
    await pool.promise().query(query, [fileName, user_idx, af_idx]);

    console.log('JSON 파일 업데이트 및 DB 수정 완료');
    console.log(oldFileName, '------->', newFileName);

    const old_pythonFilePath = `../files/aas/${oldFileName}`;
    const pythonFilePath = `../files/aas/${fileName}`;

    const pythonResponse = await fetch(`${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}/api/aas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_path: old_pythonFilePath,
        path: pythonFilePath,
      }),
    });

    return {
      success: true,
      fileName: newFileName,
      filePath: file_path,
    };
  } catch (err) {
    console.log('Failed to update JSON File: ', err);
    throw err;
  }
};

export const deleteFilesFromDB = async (ids) => {
  try {
    const query = `select af_name from tb_aasx_file where af_idx in (?)`;
    const [results] = await pool.promise().query(query, [ids]);

    const fileNames = results.map((row) => row.af_name);

    const query2 = `delete from tb_aasx_file where af_idx in (?)`;
    await pool.promise().query(query2, [ids]);

    console.log('Python JSON Files deleted successfully');

    const filePaths = fileNames.map((name) => `../files/aas/${name}`);

    const pythonResponse = await fetch(`${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}/api/aas`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paths: filePaths,
      }),
    });
  } catch (err) {
    console.log('Failed to delete Python JSON Files: ', err);
    throw err;
  }
};

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
    const [rows] = await pool.promise().query('SELECT af_name FROM tb_aasx_file WHERE af_idx = ?', [af_idx]);

    if (rows.length === 0) {
      throw new Error('파일을 찾을 수 없습니다.');
    }

    const oldFileName = rows[0].af_name;
    const newFileName = fileName.replace(/\.json$/i, '.aasx');

    // 이전 파일들 삭제
    const oldAasFileName = oldFileName.replace(/\.aasx$/i, '.json');
    const oldAasPath = `../files/aas/${oldAasFileName}`;
    const oldAasxPath = `../files/aasx/${oldFileName}`;

    // Python 서버를 호출해서 이전 파일들 삭제
    const deleteResponse = await fetch(`${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}/api/aas`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paths: [oldAasPath, oldAasxPath],
      }),
    });

    // front 폴더의 JSON 파일 경로
    const frontFilePath = `../files/front/${fileName}`;

    // Python 서버를 호출해서 AAS용 JSON 파일 생성
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

    // Python 서버를 호출해서 AASX 파일 생성
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

    // AASX 파일명을 DB에 업데이트
    const query = `UPDATE tb_aasx_file SET af_name = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP WHERE af_idx = ?`;
    await pool.promise().query(query, [newFileName, user_idx, af_idx]);

    console.log('AASX 파일 업데이트 및 DB 수정 완료');

    return {
      success: true,
      fileName: newFileName,
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
    // 삭제할 파일 정보 조회
    const query = `select af_name from tb_aasx_file where af_idx in (?)`;
    const [results] = await pool.promise().query(query, [ids]);

    if (results.length === 0) {
      console.log('삭제할 파일이 없습니다.');
      return {
        success: true,
        message: '삭제할 파일이 없습니다.',
        deletedCount: 0,
      };
    }

    const fileNames = results.map((row) => row.af_name);

    // DB에서 파일 정보 삭제
    const deleteQuery = `delete from tb_aasx_file where af_idx in (?)`;
    await pool.promise().query(deleteQuery, [ids]);

    console.log('DB에서 파일 정보 삭제 완료');

    // 삭제할 파일 경로들 준비
    const deletePaths = [];

    fileNames.forEach((fileName) => {
      // aasx 파일 경로
      deletePaths.push(`../files/aasx/${fileName}`);

      // aas 파일 경로 (aasx 확장자를 json으로 변경)
      const aasFileName = fileName.replace(/\.aasx$/i, '.json');
      deletePaths.push(`../files/aas/${aasFileName}`);

      // front 파일 경로 (aasx 확장자를 json으로 변경)
      deletePaths.push(`../files/front/${aasFileName}`);
    });

    // Python 서버를 호출해서 모든 파일 삭제
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

    console.log('모든 파일 삭제 완료');

    return {
      success: true,
      message: '파일이 성공적으로 삭제되었습니다.',
      deletedCount: results.length,
      deletedFiles: fileNames,
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
