import { pool } from '../../index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파일명으로 fc_idx 조회
export const getFileFCIdxFromDB = async (fileName) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT fc_idx FROM tb_aasx_file WHERE af_name = ? AND af_kind = 1 LIMIT 1`;

    pool.query(query, [fileName], (err, results) => {
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
    // 파일명 중복 체크
    const [existing] = await pool
      .promise()
      .query('SELECT af_idx FROM tb_aasx_file WHERE af_name = ? AND (af_kind = 2 OR af_kind = 3)', [fileName]);
    if (existing.length > 0) {
      throw new Error('이미 생성되어있는 파일입니다.');
    }

    const frontFilePath = `../files/front/${fileName}`;

    // AAS 파일 생성
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

      // 응답 내용 확인
      const responseText = await aasResponse.text();
      console.log('AAS 파일 생성 응답:', responseText);
    } catch (error) {
      console.error('AAS 파일 생성 중 오류가 발생했습니다:', error.message);

      // 파일이 실제로 생성되었는지 확인
      const fs = await import('fs');
      const aasFilePath = `../files/aas/${fileName}`;

      if (fs.existsSync(aasFilePath)) {
        // 파일 크기 확인
        const stats = fs.statSync(aasFilePath);
        if (stats.size > 0) {
          console.log('AAS 파일이 생성되었습니다. 계속 진행합니다.');
        } else {
          console.error('AAS 파일이 생성되었지만 크기가 0입니다.');
          throw new Error('AAS 파일 생성에 실패했습니다.');
        }
      } else {
        console.error('AAS 파일이 생성되지 않았습니다.');
        throw new Error('AAS 파일 생성에 실패했습니다.');
      }
    }

    // AAS 파일 DB 저장
    const aasFileName = fileName;
    const aasQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, 2, ?, '/files/aas', ?, ?)`;
    const [aasResult] = await pool.promise().query(aasQuery, [fc_idx, aasFileName, user_idx, user_idx]);
    aasInsertId = aasResult.insertId;
    createdFiles.push({ type: 'aas', path: `../files/aas/${fileName}`, insertId: aasInsertId });

    const aasFilePath = `../files/aas/${fileName}`;

    // AASX 파일 생성
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

      // 응답 내용 확인
      const responseText = await aasxResponse.text();
      console.log('AASX 파일 생성 응답:', responseText);
    } catch (error) {
      console.error('AASX 파일 생성 중 오류가 발생했습니다:', error.message);

      // 파일이 실제로 생성되었는지 확인
      const fs = await import('fs');
      const aasxFileName = fileName.replace(/\.json$/i, '.aasx');
      const aasxFilePath = `../files/aasx/${aasxFileName}`;

      if (fs.existsSync(aasxFilePath)) {
        // 파일 크기 확인
        const stats = fs.statSync(aasxFilePath);
        if (stats.size > 0) {
          console.log('AASX 파일이 생성되었습니다. 계속 진행합니다.');
        } else {
          console.error('AASX 파일이 생성되었지만 크기가 0입니다.');
          throw new Error('AASX 파일 생성에 실패했습니다.');
        }
      } else {
        console.error('AASX 파일이 생성되지 않았습니다.');
        throw new Error('AASX 파일 생성에 실패했습니다.');
      }
    }

    // AASX 파일 DB 저장
    const aasxFileName = fileName.replace(/\.json$/i, '.aasx');
    const aasxQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, 3, ?, '/files/aasx', ?, ?)`;
    const [aasxResult] = await pool.promise().query(aasxQuery, [fc_idx, aasxFileName, user_idx, user_idx]);
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

    // 실패 시 생성된 파일들 정리
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

    console.log('생성된 파일들이 정리되었습니다.');
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

    // 기존 파일 정보 조회
    const [aasxRows] = await pool
      .promise()
      .query('SELECT af_name FROM tb_aasx_file WHERE af_idx = ? AND af_kind = 3', [af_idx]);

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

    // 새 AAS 파일 생성
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

      // 응답 내용 확인
      const responseText = await aasResponse.text();
      console.log('AAS 파일 생성 응답:', responseText);
    } catch (error) {
      console.error('AAS 파일 생성 중 오류가 발생했습니다:', error.message);
      throw new Error('AAS 파일 생성 중 오류가 발생했습니다.');
    }

    // 새 AAS 파일 DB 저장
    const [existingAasRows] = await pool
      .promise()
      .query('SELECT af_idx FROM tb_aasx_file WHERE af_name = ? AND af_kind = 2', [oldAasFileName]);

    if (existingAasRows.length > 0) {
      const updateAasQuery = `UPDATE tb_aasx_file SET af_name = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP WHERE af_name = ? AND af_kind = 2`;
      await pool.promise().query(updateAasQuery, [newAasFileName, user_idx, oldAasFileName]);
    } else {
      const insertAasQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, 2, ?, '/files/aas', ?, ?)`;
      const [aasResult] = await pool.promise().query(insertAasQuery, [fc_idx, newAasFileName, user_idx, user_idx]);
      newAasInsertId = aasResult.insertId;
      createdFiles.push({ type: 'aas', path: `../files/aas/${fileName}`, insertId: newAasInsertId });
    }

    const aasFilePath = `../files/aas/${fileName}`;

    // 새 AASX 파일 생성
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

      // 응답 내용 확인
      const responseText = await aasxResponse.text();
      console.log('AASX 파일 생성 응답:', responseText);
    } catch (error) {
      console.error('AASX 파일 생성 중 오류가 발생했습니다:', error.message);
      throw new Error('AASX 파일 생성 중 오류가 발생했습니다.');
    }

    // 새 AASX 파일 DB 저장
    const insertAasxQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, 3, ?, '/files/aasx', ?, ?)`;
    const [aasxResult] = await pool.promise().query(insertAasxQuery, [fc_idx, newAasxFileName, user_idx, user_idx]);
    newAasxInsertId = aasxResult.insertId;
    createdFiles.push({ type: 'aasx', path: `../files/aasx/${newAasxFileName}`, insertId: newAasxInsertId });

    // 기존 파일 삭제 (새 파일 생성이 성공한 후에만)
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

    // 기존 DB 레코드 삭제
    await pool.promise().query('DELETE FROM tb_aasx_file WHERE af_name = ? AND af_kind = 2', [oldAasFileName]);
    await pool.promise().query('DELETE FROM tb_aasx_file WHERE af_idx = ? AND af_kind = 3', [af_idx]);

    return {
      success: true,
      fileName: newAasxFileName,
      filePath: '/files/aasx',
      af_idx: newAasxInsertId,
      message: '변환 완료: AAS JSON, AASX 파일이 모두 업데이트되었습니다.',
    };
  } catch (err) {
    console.error('Failed to update AASX File: ', err);

    // 실패 시 새로 생성된 파일들 정리
    await cleanupCreatedFiles(createdFiles);

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

// 파일 크기만 확인하는 함수
export const checkFileSizeFromDB = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('파일 크기 확인 시작:', file);
      let af_path = file.af_path;
      let af_name = file.af_name;
      let af_kind = file.af_kind;

      if (!af_path || !af_name || !af_kind) {
        console.log('DB에서 파일 정보 조회 중...');
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
            console.log('DB에서 조회된 파일 정보:', { af_path, af_name, af_kind });

            let filePath;
            let fileName;

            if (af_kind === 1) {
              // JSON 파일 (front/ 폴더)
              fileName = af_name;
              filePath = path.join(__dirname, '../../../../files/front', fileName);
              console.log('JSON 파일 경로:', filePath);
            } else {
              // AAS 파일 (aas/ 폴더)
              fileName = af_name.replace(/\.aasx$/i, '.json');
              filePath = path.join(__dirname, '../../../../files/aas', fileName);
              console.log('AAS 파일 경로:', filePath);
            }

            // 파일 존재 여부 확인
            if (!fs.existsSync(filePath)) {
              console.error('파일이 존재하지 않음:', filePath);
              reject(new Error('해당하는 파일이 존재하지 않습니다.'));
              return;
            }

            // 파일 크기 확인
            const fileStats = fs.statSync(filePath);
            console.log(`파일 크기: ${fileStats.size} bytes`);

            const result = {
              size: fileStats.size,
              fileName: fileName,
              filePath: filePath,
              isLargeFile: fileStats.size > 500 * 1024 * 1024,
            };
            console.log('파일 크기 확인 결과:', result);
            resolve(result);
          }
        );
      } else {
        let filePath;
        let fileName;

        if (af_kind === 1) {
          // JSON 파일 (front/ 폴더)
          fileName = af_name;
          filePath = path.join(__dirname, '../../../../files/front', fileName);
          console.log('JSON 파일 경로:', filePath);
        } else {
          // AAS 파일 (aas/ 폴더)
          fileName = af_name.replace(/\.aasx$/i, '.json');
          filePath = path.join(__dirname, '../../../../files/aas', fileName);
          console.log('AAS 파일 경로:', filePath);
        }

        // 파일 존재 여부 확인
        if (!fs.existsSync(filePath)) {
          console.error('파일이 존재하지 않음:', filePath);
          reject(new Error('해당하는 파일이 존재하지 않습니다.'));
          return;
        }

        // 파일 크기 확인
        const fileStats = fs.statSync(filePath);
        console.log(`파일 크기: ${fileStats.size} bytes`);

        const result = {
          size: fileStats.size,
          fileName: fileName,
          filePath: filePath,
          isLargeFile: fileStats.size > 500 * 1024 * 1024,
        };
        console.log('파일 크기 확인 결과:', result);
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

      // af_path, af_name, af_kind이 없으면 DB에서 조회
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

      if (af_kind === 1) {
        // JSON 파일 (front/ 폴더)
        fileName = af_name;
        filePath = path.join(__dirname, '../../../../files/front', fileName);
        console.log('JSON 파일 경로:', filePath);
      } else {
        // AASX 파일 경로
        const aasxFilePath = path.join(__dirname, '../../../../', af_path, af_name);

        // AAS 파일명 생성 (.aasx -> .json)
        fileName = af_name.replace(/\.aasx$/i, '.json');
        filePath = path.join(__dirname, '../../../../files/aas', fileName);
        console.log('AAS 파일 경로:', filePath);

        // AASX 파일 존재 여부 확인
        if (!fs.existsSync(aasxFilePath)) {
          reject(new Error('AASX 파일이 존재하지 않습니다.'));
          return;
        }
      }

      // 파일 존재 여부 확인
      if (!fs.existsSync(filePath)) {
        reject(new Error('해당하는 파일이 존재하지 않습니다.'));
        return;
      }

      // 파일 크기 확인
      const fileStats = fs.statSync(filePath);
      console.log(`파일 크기: ${fileStats.size} bytes`);

      // 파일이 너무 큰 경우 처리
      if (fileStats.size > 500 * 1024 * 1024) {
        // 500MB 이상
        reject(new Error('FILE_TOO_LARGE'));
        return;
      }

      // 파일 읽기 (JSON 데이터) - 스트리밍 방식
      const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
      let fileData = '';
      let isJsonStart = false;

      readStream.on('data', (chunk) => {
        fileData += chunk;

        // 첫 번째 청크에서 JSON 시작 확인
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
        // 파일 내용이 비어있는지 확인
        if (!fileData || fileData.trim() === '') {
          reject(new Error('파일이 비어있습니다.'));
          return;
        }

        try {
          const jsonData = JSON.parse(fileData);

          if (af_kind === 1) {
            // JSON 파일인 경우
            resolve({
              aasData: jsonData,
              jsonFile: {
                name: fileName,
                path: '/files/front',
              },
              fileSize: fileStats.size,
            });
          } else {
            // AASX 파일인 경우 AASX 파일도 읽기
            const aasxFilePath = path.join(__dirname, '../../../../', af_path, af_name);
            fs.readFile(aasxFilePath, (err, aasxFileData) => {
              if (err) {
                console.error('AASX 파일 읽기 오류:', err);
                reject(new Error('AASX 파일 읽기 실패'));
                return;
              }

              // AASX 파일이 비어있는지 확인
              if (!aasxFileData || aasxFileData.length === 0) {
                reject(new Error('AASX 파일이 비어있습니다.'));
                return;
              }

              // AAS JSON 데이터와 AASX 파일 정보를 함께 반환
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
