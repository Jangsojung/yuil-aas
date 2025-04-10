import { pool } from '../../index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const insertFileToDB = async (fc_idx, file) => {
  try {
    const file_name = file.originalname;
    const file_path = '/src/files/python';

    const query = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path) VALUES (?, 2, ?, ?)`;
    await pool.promise().query(query, [fc_idx, file_name, file_path]);

    console.log('JSON 파일 저장 및 DB 등록 완료');

    return {
      success: true,
      fileName: file_name,
      filePath: file_path,
    };
  } catch (err) {
    console.log('Failed to insert JSON File: ', err);
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
