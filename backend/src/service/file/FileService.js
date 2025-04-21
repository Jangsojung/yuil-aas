import { pool } from '../../index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const insertFileToDB = async (fc_idx, fileName) => {
  try {
    const file_path = '/files/aas';

    const query = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path) VALUES (?, 2, ?, ?)`;
    await pool.promise().query(query, [fc_idx, fileName, file_path]);

    console.log('JSON 파일 저장 및 DB 등록 완료');

    const pythonFilePath = `../files/front/${fileName}`;

    const pythonResponse = await fetch('http://localhost:5000/api/aas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: pythonFilePath,
      }),
    });

    console.log('Python 서버에 경로 전달 성공:', pythonResponse.data);

    return {
      success: true,
      fileName: fileName,
      filePath: file_path,
    };
  } catch (err) {
    console.log('Failed to insert JSON File: ', err);
    throw err;
  }
};

export const updateFileToDB = async (af_idx, fileName) => {
  try {
    const [rows] = await pool.promise().query('SELECT af_name FROM tb_aasx_file WHERE af_idx = ?', [af_idx]);

    if (!rows.length) {
      throw new Error('파일을 찾을 수 없습니다.');
    }

    const oldFileName = rows[0].af_name;
    const newFileName = fileName;

    const file_path = '/files/aas';
    const query = `UPDATE tb_aasx_file SET af_name = ? WHERE af_idx = ?`;
    await pool.promise().query(query, [fileName, af_idx]);

    console.log('JSON 파일 업데이트 및 DB 수정 완료');
    console.log(oldFileName, '------->', newFileName);

    const old_pythonFilePath = `../files/aas/${oldFileName}`;
    const pythonFilePath = `../files/aas/${fileName}`;

    const pythonResponse = await fetch('http://127.0.0.1:5000/api/aas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_path: old_pythonFilePath,
        path: pythonFilePath,
      }),
    });

    console.log('Python 서버에 경로 전달 성공:', pythonResponse.data);

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

    const pythonResponse = await fetch('http://localhost:5000/api/aas', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paths: filePaths,
      }),
    });

    console.log('Python 서버에 경로 전달 성공:', pythonResponse.data);
  } catch (err) {
    console.log('Failed to delete Python JSON Files: ', err);
    throw err;
  }
};

export const getAASXFilesFromDB = async () => {
  return new Promise((resolve, reject) => {
    const query =
      'select af_idx, af_name, createdAt from tb_aasx_file where af_kind = 3 and fc_idx = 3 order by af_idx desc';

    pool.query(query, (err, results) => {
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

export const insertAASXFileToDB = async (fc_idx, fileName) => {
  try {
    const file_path = '/files/aasx';
    const aasxFileName = fileName.replace(/\.json$/i, '.aasx');

    const query = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path) VALUES (?, 3, ?, ?)`;
    await pool.promise().query(query, [fc_idx, aasxFileName, file_path]);

    console.log('JSON 파일 저장 및 DB 등록 완료');

    const pythonFilePath = `../files/aas/${fileName}`;

    const pythonResponse = await fetch('http://localhost:5000/api/aasx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: pythonFilePath,
      }),
    });

    console.log('Python 서버에 경로 전달 성공:', pythonResponse.data);

    return {
      success: true,
      fileName: aasxFileName,
      filePath: file_path,
    };
  } catch (err) {
    console.log('Failed to insert JSON File: ', err);
    throw err;
  }
};

export const updateAASXFileToDB = async (af_idx, fileName) => {
  try {
    const [rows] = await pool.promise().query('SELECT af_name FROM tb_aasx_file WHERE af_idx = ?', [af_idx]);

    if (rows.length === 0) {
      throw new Error('파일을 찾을 수 없습니다.');
    }

    const oldFileName = rows[0].af_name.replace(/\.aasx$/i, '.json');
    const newFileName = fileName.replace(/\.json$/i, '.aasx');

    const file_path = '/files/aasx';

    const query = `UPDATE tb_aasx_file SET af_name = ? WHERE af_idx = ?`;
    await pool.promise().query(query, [newFileName, af_idx]);

    console.log('JSON 파일 업데이트 및 DB 수정 완료');

    const old_pythonFilePath = `../files/aasx/${oldFileName}`;
    const pythonFilePath = `../files/aasx/${newFileName}`;

    console.log(old_pythonFilePath, ' ', pythonFilePath);

    const pythonResponse = await fetch('http://localhost:5000/api/aasx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_path: old_pythonFilePath,
        path: pythonFilePath,
      }),
    });

    console.log('Python 서버에 경로 전달 성공:', pythonResponse.data);
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

export const deleteAASXFilesFromDB = async (ids) => {
  try {
    const query = `select af_name from tb_aasx_file where af_idx in (?)`;
    const [results] = await pool.promise().query(query, [ids]);

    const fileNames = results.map((row) => row.af_name);

    const query2 = `delete from tb_aasx_file where af_idx in (?)`;
    await pool.promise().query(query2, [ids]);

    console.log('Python JSON Files deleted successfully');

    const filePaths = fileNames.map((name) => `../files/aasx/${name}`);

    const pythonResponse = await fetch('http://localhost:5000/api/aas', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paths: filePaths,
      }),
    });

    console.log('Python 서버에 경로 전달 성공:', pythonResponse.data);
  } catch (err) {
    console.log('Failed to delete Python JSON Files: ', err);
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
