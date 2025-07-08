import { pool } from '../../index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { FILE_KINDS } from '../../constants/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getFileFCIdxFromDB = async (fileName, af_kind) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT fc_idx FROM tb_aasx_file WHERE af_name = ? AND af_kind = ? LIMIT 1`;

    pool.query(query, [fileName, af_kind], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      if (results.length === 0) {
        resolve(null);
        return;
      }

      resolve(results[0].fc_idx);
    });
  });
};

export const getFilesFromDB = async (af_kind, fc_idx, startDate = null, endDate = null, user_idx = null) => {
  return new Promise((resolve, reject) => {
    let query = '';
    const queryParams = [];

    let baseWhereClause = `f.af_kind = ?`;
    queryParams.push(af_kind);
    if (fc_idx !== -1) {
      baseWhereClause += ` AND f.fc_idx = ?`;
      queryParams.push(fc_idx);
    }

    let dateClause = '';
    if (startDate && endDate) {
      dateClause = ` AND f.createdAt BETWEEN ? AND ?`;
      const startDateTime = `${startDate} 00:00:00`;
      const endDateTime = `${endDate} 23:59:59`;
      queryParams.push(startDateTime, endDateTime);
    }

    if (af_kind === FILE_KINDS.JSON_KIND) {
      query = `
        SELECT 
          f.af_idx, 
          f.af_name, 
          f.createdAt,
          f.updatedAt,
          f.fc_idx,
          b.ab_name AS base_name,
           COUNT(DISTINCT bs.sn_idx) AS sn_length
        FROM tb_aasx_file f
        LEFT JOIN tb_aasx_base b 
          ON b.ab_idx = CAST(SUBSTRING_INDEX(f.af_name, '-', 1) AS UNSIGNED)
        LEFT JOIN tb_aasx_base_sensor bs 
          ON bs.ab_idx = b.ab_idx
        WHERE ${baseWhereClause}
        ${dateClause}
        GROUP BY f.af_idx, f.af_name, f.createdAt, f.updatedAt, f.fc_idx, b.ab_name
        ORDER BY f.af_idx DESC
      `;
    } else {
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
        if (af_kind === FILE_KINDS.JSON_KIND) {
          return {
            af_idx: file.af_idx,
            af_name: file.af_name,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            fc_idx: file.fc_idx,
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
  let aasInsertId = null;
  let aasxInsertId = null;
  let createdFiles = [];

  try {
    const [existing] = await pool
      .promise()
      .query('SELECT af_idx FROM tb_aasx_file WHERE af_name = ? AND (af_kind = ? OR af_kind = ?)', [
        fileName,
        FILE_KINDS.AAS_KIND,
        FILE_KINDS.AASX_KIND,
      ]);
    if (existing.length > 0) {
      throw new Error('이미 생성되어있는 파일입니다.');
    }

    const frontFilePath = `../files/front/${fileName}`;

    try {
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
        const errorText = await aasResponse.text();
        console.error('AAS 파일 생성 응답 오류:', aasResponse.status, errorText);
        throw new Error(`AAS 파일 생성 중 오류가 발생했습니다. (${aasResponse.status})`);
      }

      const responseText = await aasResponse.text();
    } catch (error) {
      console.error('AAS 파일 생성 중 오류가 발생했습니다:', error.message);

      const fs = await import('fs');
      const aasFilePath = `../files/aas/${fileName}`;

      if (fs.existsSync(aasFilePath)) {
        const stats = fs.statSync(aasFilePath);
        if (stats.size > 0) {
        } else {
          console.error('AAS 파일이 생성되었지만 크기가 0입니다.');
          throw new Error('AAS 파일 생성에 실패했습니다.');
        }
      } else {
        console.error('AAS 파일이 생성되지 않았습니다.');
        throw new Error('AAS 파일 생성에 실패했습니다.');
      }
    }

    const aasFileName = fileName;
    const aasQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, ?, ?, '/files/aas', ?, ?)`;
    const [aasResult] = await pool
      .promise()
      .query(aasQuery, [fc_idx, FILE_KINDS.AAS_KIND, aasFileName, user_idx, user_idx]);
    aasInsertId = aasResult.insertId;
    createdFiles.push({ type: 'aas', path: `../files/aas/${fileName}`, insertId: aasInsertId });

    const aasFilePath = `../files/aas/${fileName}`;

    try {
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
        const errorText = await aasxResponse.text();
        console.error('AASX 파일 생성 응답 오류:', aasxResponse.status, errorText);
        throw new Error(`AASX 파일 생성 중 오류가 발생했습니다. (${aasxResponse.status})`);
      }

      const responseText = await aasxResponse.text();
    } catch (error) {
      console.error('AASX 파일 생성 중 오류가 발생했습니다:', error.message);

      const fs = await import('fs');
      const aasxFileName = fileName.replace(/\.json$/i, '.aasx');
      const aasxFilePath = `../files/aasx/${aasxFileName}`;

      if (fs.existsSync(aasxFilePath)) {
        const stats = fs.statSync(aasxFilePath);
        if (stats.size > 0) {
        } else {
          console.error('AASX 파일이 생성되었지만 크기가 0입니다.');
          throw new Error('AASX 파일 생성에 실패했습니다.');
        }
      } else {
        console.error('AASX 파일이 생성되지 않았습니다.');
        throw new Error('AASX 파일 생성에 실패했습니다.');
      }
    }

    const aasxFileName = fileName.replace(/\.json$/i, '.aasx');
    const aasxQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, ?, ?, '/files/aasx', ?, ?)`;
    const [aasxResult] = await pool
      .promise()
      .query(aasxQuery, [fc_idx, FILE_KINDS.AASX_KIND, aasxFileName, user_idx, user_idx]);
    aasxInsertId = aasxResult.insertId;
    createdFiles.push({ type: 'aasx', path: `../files/aasx/${aasxFileName}`, insertId: aasxInsertId });

    return {
      success: true,
      fileName: aasxFileName,
      filePath: '/files/aasx',
      af_idx: aasxInsertId,
      message: '변환 완료: AAS JSON, AASX 파일이 모두 생성되었습니다.',
    };
  } catch (err) {
    console.error('Failed to insert AASX File: ', err);

    await cleanupCreatedFiles(createdFiles);

    throw err;
  }
};

// 생성된 파일들을 정리하는 함수
const cleanupCreatedFiles = async (createdFiles) => {
  try {
    if (createdFiles.length === 0) return;

    // DB에서 삭제
    const insertIds = createdFiles.map((file) => file.insertId);
    if (insertIds.length > 0) {
      await pool.promise().query('DELETE FROM tb_aasx_file WHERE af_idx IN (?)', [insertIds]);
    }

    // 실제 파일 삭제
    const deletePaths = createdFiles.map((file) => file.path);
    if (deletePaths.length > 0) {
      const deleteResponse = await fetch(`${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}/api/aas`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paths: deletePaths,
        }),
      });

      if (!deleteResponse.ok) {
        console.error('생성된 파일 정리 중 오류 발생');
      }
    }
  } catch (cleanupError) {
    console.error('파일 정리 중 오류 발생:', cleanupError);
  }
};

export const updateAASXFileToDB = async (af_idx, fileName, user_idx, fc_idx) => {
  let newAasInsertId = null;
  let newAasxInsertId = null;
  let createdFiles = [];
  let oldFileInfo = null;

  try {
    const newAasxFileName = fileName.replace(/\.json$/i, '.aasx');
    const [existing] = await pool
      .promise()
      .query('SELECT af_idx FROM tb_aasx_file WHERE af_name = ? AND (af_kind = ? OR af_kind = ?) AND af_idx != ?', [
        newAasxFileName,
        FILE_KINDS.AAS_KIND,
        FILE_KINDS.AASX_KIND,
        af_idx,
      ]);
    if (existing.length > 0) {
      throw new Error('이미 생성되어있는 파일입니다.');
    }

    const [aasxRows] = await pool
      .promise()
      .query('SELECT af_name FROM tb_aasx_file WHERE af_idx = ? AND af_kind = ?', [af_idx, FILE_KINDS.AASX_KIND]);

    if (aasxRows.length === 0) {
      throw new Error('수정할 AASX 파일을 찾을 수 없습니다.');
    }

    const oldAasxFileName = aasxRows[0].af_name;
    const oldAasFileName = oldAasxFileName.replace(/\.aasx$/i, '.json');
    const newAasFileName = fileName;

    oldFileInfo = {
      oldAasFileName,
      oldAasxFileName,
      oldAasPath: `../files/aas/${oldAasFileName}`,
      oldAasxPath: `../files/aasx/${oldAasxFileName}`,
    };

    const frontFilePath = `../files/front/${fileName}`;

    try {
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
        const errorText = await aasResponse.text();
        console.error('AAS 파일 생성 응답 오류:', aasResponse.status, errorText);
        throw new Error(`AAS 파일 생성 중 오류가 발생했습니다. (${aasResponse.status})`);
      }

      const responseText = await aasResponse.text();
    } catch (error) {
      console.error('AAS 파일 생성 중 오류가 발생했습니다:', error.message);
      throw new Error('AAS 파일 생성 중 오류가 발생했습니다.');
    }

    const [existingAasRows] = await pool
      .promise()
      .query('SELECT af_idx FROM tb_aasx_file WHERE af_name = ? AND af_kind = ?', [
        oldAasFileName,
        FILE_KINDS.AAS_KIND,
      ]);

    if (existingAasRows.length > 0) {
      const updateAasQuery = `UPDATE tb_aasx_file SET af_name = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP WHERE af_name = ? AND af_kind = ?`;
      await pool.promise().query(updateAasQuery, [newAasFileName, user_idx, oldAasFileName, FILE_KINDS.AAS_KIND]);
    } else {
      const insertAasQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, ?, ?, '/files/aas', ?, ?)`;
      const [aasResult] = await pool
        .promise()
        .query(insertAasQuery, [fc_idx, FILE_KINDS.AAS_KIND, newAasFileName, user_idx, user_idx]);
      newAasInsertId = aasResult.insertId;
      createdFiles.push({ type: 'aas', path: `../files/aas/${fileName}`, insertId: newAasInsertId });
    }

    const aasFilePath = `../files/aas/${fileName}`;

    try {
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
        const errorText = await aasxResponse.text();
        console.error('AASX 파일 생성 응답 오류:', aasxResponse.status, errorText);
        throw new Error(`AASX 파일 생성 중 오류가 발생했습니다. (${aasxResponse.status})`);
      }

      const responseText = await aasxResponse.text();
    } catch (error) {
      console.error('AASX 파일 생성 중 오류가 발생했습니다:', error.message);
      throw new Error('AASX 파일 생성 중 오류가 발생했습니다.');
    }

    const insertAasxQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, ?, ?, '/files/aasx', ?, ?)`;
    const [aasxResult] = await pool
      .promise()
      .query(insertAasxQuery, [fc_idx, FILE_KINDS.AASX_KIND, newAasxFileName, user_idx, user_idx]);
    newAasxInsertId = aasxResult.insertId;
    createdFiles.push({ type: 'aasx', path: `../files/aasx/${newAasxFileName}`, insertId: newAasxInsertId });

    const deleteResponse = await fetch(`${process.env.PYTHON_SERVER_URL || 'http://localhost:5000'}/api/aas`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paths: [oldFileInfo.oldAasPath, oldFileInfo.oldAasxPath],
      }),
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('기존 파일 삭제 중 오류 발생:', errorText);
    }

    await pool
      .promise()
      .query('DELETE FROM tb_aasx_file WHERE af_name = ? AND af_kind = ?', [oldAasFileName, FILE_KINDS.AAS_KIND]);
    await pool
      .promise()
      .query('DELETE FROM tb_aasx_file WHERE af_idx = ? AND af_kind = ?', [af_idx, FILE_KINDS.AASX_KIND]);

    return {
      success: true,
      fileName: newAasxFileName,
      filePath: '/files/aasx',
      af_idx: newAasxInsertId,
      message: '변환 완료: AAS JSON, AASX 파일이 모두 업데이트되었습니다.',
    };
  } catch (err) {
    console.error('Failed to update AASX File: ', err);

    await cleanupCreatedFiles(createdFiles);

    throw err;
  }
};

export const deleteFilesFromDB = async (ids) => {
  try {
    const query = `select af_idx, af_name, af_kind from tb_aasx_file where af_idx in (?)`;
    const [results] = await pool.promise().query(query, [ids]);

    if (results.length === 0) {
      return {
        success: true,
        message: '삭제할 파일이 없습니다.',
        deletedCount: 0,
      };
    }

    const aasxFiles = results.filter((file) => file.af_kind === FILE_KINDS.AASX_KIND);
    const jsonFiles = results.filter((file) => file.af_kind === FILE_KINDS.JSON_KIND);

    const deletePaths = [];

    if (aasxFiles.length > 0) {
      const aasxFileNames = aasxFiles.map((row) => row.af_name);
      const aasFileNames = aasxFileNames.map((fileName) => fileName.replace(/\.aasx$/i, '.json'));

      aasxFileNames.forEach((fileName) => {
        deletePaths.push(`../files/aasx/${fileName}`);
        const aasFileName = fileName.replace(/\.aasx$/i, '.json');
        deletePaths.push(`../files/aas/${aasFileName}`);
      });

      const deleteAasQuery = `delete from tb_aasx_file where af_name in (?) and af_kind = ?`;
      await pool.promise().query(deleteAasQuery, [aasFileNames, FILE_KINDS.AAS_KIND]);
    }

    if (jsonFiles.length > 0) {
      const jsonFileNames = jsonFiles.map((row) => row.af_name);
      jsonFileNames.forEach((fileName) => {
        deletePaths.push(`../files/front/${fileName}`);
      });
    }

    const deleteQuery = `delete from tb_aasx_file where af_idx in (?)`;
    await pool.promise().query(deleteQuery, [ids]);

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

export const checkFileSizeFromDB = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      let af_path = file.af_path;
      let af_name = file.af_name;
      let af_kind = file.af_kind;

      if (!af_path || !af_name || !af_kind) {
        pool.query(
          'SELECT af_path, af_name, af_kind FROM tb_aasx_file WHERE af_idx = ?',
          [file.af_idx],
          (err, rows) => {
            if (err || !rows || rows.length === 0) {
              console.error('DB 조회 실패:', err);
              reject(new Error('DB에서 파일 정보를 찾을 수 없습니다.'));
              return;
            }
            af_path = rows[0].af_path;
            af_name = rows[0].af_name;
            af_kind = rows[0].af_kind;
            let filePath;
            let fileName;

            if (af_kind === FILE_KINDS.JSON_KIND) {
              fileName = af_name;
              filePath = path.join(__dirname, '../../../../files/front', fileName);
            } else {
              fileName = af_name.replace(/\.aasx$/i, '.json');
              filePath = path.join(__dirname, '../../../../files/aas', fileName);
            }

            if (!fs.existsSync(filePath)) {
              console.error('파일이 존재하지 않음:', filePath);
              reject(new Error('해당하는 파일이 존재하지 않습니다.'));
              return;
            }

            const fileStats = fs.statSync(filePath);

            const result = {
              size: fileStats.size,
              fileName: fileName,
              filePath: filePath,
              isLargeFile: fileStats.size > 500 * 1024 * 1024,
            };
            resolve(result);
          }
        );
      } else {
        let filePath;
        let fileName;

        if (af_kind === FILE_KINDS.JSON_KIND) {
          fileName = af_name;
          filePath = path.join(__dirname, '../../../../files/front', fileName);
        } else {
          fileName = af_name.replace(/\.aasx$/i, '.json');
          filePath = path.join(__dirname, '../../../../files/aas', fileName);
        }

        if (!fs.existsSync(filePath)) {
          console.error('파일이 존재하지 않음:', filePath);
          reject(new Error('해당하는 파일이 존재하지 않습니다.'));
          return;
        }

        const fileStats = fs.statSync(filePath);

        const result = {
          size: fileStats.size,
          fileName: fileName,
          filePath: filePath,
          isLargeFile: fileStats.size > 500 * 1024 * 1024,
        };
        resolve(result);
      }
    } catch (error) {
      console.error('파일 크기 확인 오류:', error);
      reject(new Error('파일 크기 확인 실패'));
    }
  });
};

export const getVerifyFromDB = async (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      let af_path = file.af_path;
      let af_name = file.af_name;
      let af_kind = file.af_kind;

      if (!af_path || !af_name || !af_kind) {
        const [rows] = await pool
          .promise()
          .query('SELECT af_path, af_name, af_kind FROM tb_aasx_file WHERE af_idx = ?', [file.af_idx]);
        if (!rows || rows.length === 0) {
          reject(new Error('DB에서 파일 정보를 찾을 수 없습니다.'));
          return;
        }
        af_path = rows[0].af_path;
        af_name = rows[0].af_name;
        af_kind = rows[0].af_kind;
      }

      let filePath;
      let fileName;

      if (af_kind === FILE_KINDS.JSON_KIND) {
        fileName = af_name;
        filePath = path.join(__dirname, '../../../../files/front', fileName);
      } else {
        const aasxFilePath = path.join(__dirname, '../../../../', af_path, af_name);

        fileName = af_name.replace(/\.aasx$/i, '.json');
        filePath = path.join(__dirname, '../../../../files/aas', fileName);

        if (!fs.existsSync(aasxFilePath)) {
          reject(new Error('AASX 파일이 존재하지 않습니다.'));
          return;
        }
      }

      if (!fs.existsSync(filePath)) {
        reject(new Error('해당하는 파일이 존재하지 않습니다.'));
        return;
      }

      const fileStats = fs.statSync(filePath);

      if (fileStats.size > 500 * 1024 * 1024) {
        reject(new Error('FILE_TOO_LARGE'));
        return;
      }

      const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
      let fileData = '';
      let isJsonStart = false;

      readStream.on('data', (chunk) => {
        fileData += chunk;

        if (!isJsonStart && fileData.length > 0) {
          const trimmedStart = fileData.trim();
          if (!trimmedStart.startsWith('{') && !trimmedStart.startsWith('[')) {
            console.error('JSON이 아닌 파일 내용 (처음 100자):', trimmedStart.substring(0, 100));
            readStream.destroy();
            reject(new Error('유효하지 않은 JSON 파일입니다.'));
            return;
          }
          isJsonStart = true;
        }
      });

      readStream.on('end', () => {
        if (!fileData || fileData.trim() === '') {
          reject(new Error('파일이 비어있습니다.'));
          return;
        }

        try {
          const jsonData = JSON.parse(fileData);

          if (af_kind === FILE_KINDS.JSON_KIND) {
            resolve({
              aasData: jsonData,
              jsonFile: {
                name: fileName,
                path: '/files/front',
              },
              fileSize: fileStats.size,
            });
          } else {
            const aasxFilePath = path.join(__dirname, '../../../../', af_path, af_name);
            fs.readFile(aasxFilePath, (err, aasxFileData) => {
              if (err) {
                console.error('AASX 파일 읽기 오류:', err);
                reject(new Error('AASX 파일 읽기 실패'));
                return;
              }

              if (!aasxFileData || aasxFileData.length === 0) {
                reject(new Error('AASX 파일이 비어있습니다.'));
                return;
              }

              resolve({
                aasData: jsonData,
                aasxFile: {
                  name: af_name,
                  size: aasxFileData.length,
                  path: af_path,
                },
                aasFile: {
                  name: fileName,
                  path: '/files/aas',
                },
                fileSize: fileStats.size,
              });
            });
          }
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          console.error('파일 내용 (처음 200자):', fileData.substring(0, 200));
          reject(new Error('JSON 파싱 실패'));
        }
      });

      readStream.on('error', (err) => {
        console.error('파일 읽기 오류:', err);
        reject(new Error('파일 읽기 실패'));
      });
    } catch (error) {
      console.error('파일 처리 오류:', error);
      reject(new Error('파일 처리 실패'));
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

        if (!as_kr) {
          rejectUpdate(new Error('필수 필드가 누락되었습니다.'));
          return;
        }

        let query, params;
        if (original_as_en === null) {
          query = `UPDATE tb_aasx_alias SET as_en = ? WHERE as_kr = ? AND as_en IS NULL`;
          params = [new_as_en || null, as_kr];
        } else {
          query = `UPDATE tb_aasx_alias SET as_en = ? WHERE as_kr = ? AND as_en = ?`;
          params = [new_as_en || null, as_kr, original_as_en];
        }

        pool.query(query, params, (err, result) => {
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
