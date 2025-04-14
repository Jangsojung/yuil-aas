import { pool } from '../../index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const insertFileToDB = async (fc_idx, fileName) => {
  try {
    const file_path = '/files/aas';

    const query = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path) VALUES (?, 2, ?, ?)`;
    await pool.promise().query(query, [fc_idx, fileName, file_path]);

    console.log('JSON 파일 저장 및 DB 등록 완료');

    const pythonFilePath = `../files/front/${fileName}`;

    const pythonResponse = await axios.post('http://localhost:5000/api/aas', {
      path: pythonFilePath,
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

    if (rows.length === 0) {
      throw new Error('파일을 찾을 수 없습니다.');
    }

    const oldFileName = rows[0].af_name;
    const newFileName = file.originalname;
    const file_path = '/files/aas';

    const query = `UPDATE tb_aasx_file SET af_name = ? WHERE af_idx = ?`;
    await pool.promise().query(query, [fileName, af_idx]);

    console.log('JSON 파일 업데이트 및 DB 수정 완료');

    const old_pythonFilePath = `../files/front/${oldFileName}`;
    const pythonFilePath = `../files/front/${fileName}`;

    const pythonResponse = await axios.post('http://localhost:5000/api/aas', {
      old_path: old_pythonFilePath,
      path: pythonFilePath,
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
    const query = `delete from tb_aasx_file where af_idx in (?)`;
    await pool.promise().query(query, [ids]);

    console.log('Python JSON Files deleted successfully');
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

    const query = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path) VALUES (?, 3, ?, ?)`;
    await pool.promise().query(query, [fc_idx, fileName, file_path]);

    console.log('JSON 파일 저장 및 DB 등록 완료');

    const pythonFilePath = `../files/aas/${fileName}`;

    const pythonResponse = await axios.post('http://localhost:5000/api/aasx', {
      path: pythonFilePath,
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

export const updateAASXFileToDB = async (af_idx, fileName) => {
  try {
    const [rows] = await pool.promise().query('SELECT af_name FROM tb_aasx_file WHERE af_idx = ?', [af_idx]);

    if (rows.length === 0) {
      throw new Error('파일을 찾을 수 없습니다.');
    }

    const oldFileName = rows[0].af_name;
    const newFileName = file.originalname;
    const file_path = '/files/aasx';

    const query = `UPDATE tb_aasx_file SET af_name = ? WHERE af_idx = ?`;
    await pool.promise().query(query, [fileName, af_idx]);

    console.log('JSON 파일 업데이트 및 DB 수정 완료');

    const old_pythonFilePath = `../files/aas/${oldFileName}`;
    const pythonFilePath = `../files/aas/${fileName}`;

    const pythonResponse = await axios.post('http://localhost:5000/api/aasx', {
      old_path: old_pythonFilePath,
      path: pythonFilePath,
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
