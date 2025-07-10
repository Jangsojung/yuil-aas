import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { FILE_KINDS, FILE } from '../../constants/index.js';
import { validateValue, validateFcIdx, validateDate, validateNumber } from '../../utils/validation.js';
import { querySingle, queryMultiple, queryInsert, queryUpdate, withTransaction } from '../../utils/dbHelper.js';
import { createAasFile, createAasxFile, deleteFiles as deletePythonFiles } from '../../utils/pythonApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getFileFCIdxFromDB = async (fileName, af_kind) => {
  const result = await querySingle('SELECT fc_idx FROM tb_aasx_file WHERE af_name = ? AND af_kind = ? LIMIT 1', [
    fileName,
    af_kind,
  ]);
  return result ? result.fc_idx : null;
};

export const getFilesFromDB = async (
  af_kind,
  fc_idx,
  startDate = null,
  endDate = null,
  user_idx = null,
  limit = null
) => {
  // 파라미터 검증 및 변환
  const validatedAfKind = validateValue(af_kind);
  const validatedFcIdx = validateFcIdx(fc_idx);
  const validatedStartDate = validateDate(startDate);
  const validatedEndDate = validateDate(endDate);
  const validatedLimit = validateNumber(limit);

  let query = '';
  const queryParams = [];

  let baseWhereClause = `f.af_kind = ?`;
  queryParams.push(validatedAfKind);
  if (validatedFcIdx !== null) {
    baseWhereClause += ` AND f.fc_idx = ?`;
    queryParams.push(validatedFcIdx);
  }

  let dateClause = '';
  if (validatedStartDate && validatedEndDate) {
    dateClause = ` AND f.createdAt BETWEEN ? AND ?`;
    const startDateTime = `${validatedStartDate} 00:00:00`;
    const endDateTime = `${validatedEndDate} 23:59:59`;
    queryParams.push(startDateTime, endDateTime);
  }

  if (validatedAfKind === FILE_KINDS.JSON_KIND) {
    query = `
        SELECT 
          f.af_idx, 
          f.af_name, 
          f.createdAt,
          f.updatedAt,
          f.fc_idx,
          d.fc_name,
          b.ab_name AS base_name,
          COUNT(DISTINCT bs.sn_idx) AS sn_length
        FROM tb_aasx_file f
        LEFT JOIN tb_aasx_base b 
          ON b.ab_idx = CAST(SUBSTRING_INDEX(f.af_name, '-', 1) AS UNSIGNED)
        LEFT JOIN tb_aasx_base_sensor bs 
          ON bs.ab_idx = b.ab_idx
        LEFT JOIN tb_aasx_data d
          ON f.fc_idx = d.fc_idx
        WHERE ${baseWhereClause}
        ${dateClause}
        GROUP BY f.af_idx, f.af_name, f.createdAt, f.updatedAt, f.fc_idx, d.fc_name, b.ab_name
        ORDER BY f.af_idx DESC`;
    if (validatedLimit) query += ` LIMIT ?`;
  } else if (validatedAfKind === FILE_KINDS.AASX_KIND) {
    query = `
        SELECT 
          f.af_idx, 
          f.af_name, 
          f.createdAt,
          f.updatedAt,
          f.fc_idx,
          d.fc_name
        FROM tb_aasx_file f
        LEFT JOIN tb_aasx_data d
          ON f.fc_idx = d.fc_idx
        WHERE ${baseWhereClause}
        ${dateClause}
        GROUP BY f.af_idx, f.af_name, f.createdAt, f.updatedAt, f.fc_idx, d.fc_name
        ORDER BY f.af_idx DESC`;
    if (validatedLimit) query += ` LIMIT ?`;
  } else {
    query = `
        SELECT f.af_idx, f.af_name, f.createdAt, f.updatedAt
        FROM tb_aasx_file f
        WHERE ${baseWhereClause}
        ${dateClause}
        ORDER BY f.af_idx DESC`;
    if (validatedLimit) query += ` LIMIT ?`;
  }

  if (validatedLimit) queryParams.push(validatedLimit);

  const results = await queryMultiple(query, queryParams);

  if (results.length === 0) {
    return null;
  }

  const files = results.map((file) => {
    if (af_kind === FILE_KINDS.JSON_KIND) {
      return {
        af_idx: file.af_idx,
        af_name: file.af_name,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        fc_idx: file.fc_idx,
        fc_name: file.fc_name || '-',
        base_name: file.base_name || '삭제된 기초코드',
        sn_length: Number(file.sn_length) || 0,
      };
    } else if (af_kind === FILE_KINDS.AASX_KIND) {
      return {
        af_idx: file.af_idx,
        af_name: file.af_name,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        fc_idx: file.fc_idx,
        fc_name: file.fc_name || '-',
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

  return files;
};

export const insertAASXFileToDB = async (fc_idx, fileName, user_idx) => {
  return await withTransaction(async (connection) => {
    // 기존 파일 확인
    const existing = await connection.query(
      'SELECT af_idx FROM tb_aasx_file WHERE af_name = ? AND (af_kind = ? OR af_kind = ?)',
      [fileName, FILE_KINDS.AAS_KIND, FILE_KINDS.AASX_KIND]
    );
    if (existing[0].length > 0) {
      throw new Error('이미 생성되어있는 파일입니다.');
    }

    const frontFilePath = `../files/front/${fileName}`;
    let aasInsertId = null;
    let aasxInsertId = null;

    // AAS 파일 생성
    try {
      await createAasFile(frontFilePath);
    } catch (error) {
      const fs = await import('fs');
      const aasFilePath = `../files/aas/${fileName}`;

      if (fs.existsSync(aasFilePath)) {
        const stats = fs.statSync(aasFilePath);
        if (stats.size > 0) {
          // 파일이 존재하고 크기가 0보다 크면 성공으로 간주
        } else {
          throw new Error('AAS 파일 생성에 실패했습니다.');
        }
      } else {
        throw new Error('AAS 파일 생성에 실패했습니다.');
      }
    }

    const aasFileName = fileName;
    const aasQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, ?, ?, '/files/aas', ?, ?)`;
    const [aasResult] = await connection.query(aasQuery, [
      fc_idx,
      FILE_KINDS.AAS_KIND,
      aasFileName,
      user_idx,
      user_idx,
    ]);
    aasInsertId = aasResult.insertId;

    const aasFilePath = `../files/aas/${fileName}`;

    try {
      await createAasxFile(aasFilePath);
    } catch (error) {
      const fs = await import('fs');
      const aasxFileName = fileName.replace(/\.json$/i, '.aasx');
      const aasxFilePath = `../files/aasx/${aasxFileName}`;

      if (fs.existsSync(aasxFilePath)) {
        const stats = fs.statSync(aasxFilePath);
        if (stats.size > 0) {
        } else {
          throw new Error('AASX 파일 생성에 실패했습니다.');
        }
      } else {
        throw new Error('AASX 파일 생성에 실패했습니다.');
      }
    }

    const aasxFileName = fileName.replace(/\.json$/i, '.aasx');
    const aasxQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, ?, ?, '/files/aasx', ?, ?)`;
    const [aasxResult] = await connection.query(aasxQuery, [
      fc_idx,
      FILE_KINDS.AASX_KIND,
      aasxFileName,
      user_idx,
      user_idx,
    ]);
    aasxInsertId = aasxResult.insertId;

    return {
      success: true,
      fileName: aasxFileName,
      filePath: '/files/aasx',
      af_idx: aasxInsertId,
      message: '변환 완료: AAS JSON, AASX 파일이 모두 생성되었습니다.',
    };
  });
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
      const deleteResponse = await fetch(`${PYTHON_SERVER_URL}/api/aas`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paths: deletePaths,
        }),
      });

      if (!deleteResponse.ok) {
        throw new Error('생성된 파일 정리 중 오류 발생');
      }
    }
  } catch (cleanupError) {
    throw new Error('파일 정리 중 오류 발생');
  }
};

export const updateAASXFileToDB = async (af_idx, fileName, user_idx, fc_idx) => {
  let newAasInsertId = null;
  let newAasxInsertId = null;
  let createdFiles = [];
  let oldFileInfo = null;
  let connection = null;

  try {
    // 트랜잭션 시작
    connection = await pool.promise().getConnection();
    await connection.beginTransaction();

    const newAasxFileName = fileName.replace(/\.json$/i, '.aasx');
    const [existing] = await connection.query(
      'SELECT af_idx FROM tb_aasx_file WHERE af_name = ? AND (af_kind = ? OR af_kind = ?) AND af_idx != ?',
      [newAasxFileName, FILE_KINDS.AAS_KIND, FILE_KINDS.AASX_KIND, af_idx]
    );
    if (existing.length > 0) {
      throw new Error('이미 생성되어있는 파일입니다.');
    }

    const [aasxRows] = await connection.query('SELECT af_name FROM tb_aasx_file WHERE af_idx = ? AND af_kind = ?', [
      af_idx,
      FILE_KINDS.AASX_KIND,
    ]);

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
      const aasResponse = await fetch(`${PYTHON_SERVER_URL}/api/aas`, {
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
        throw new Error(`AAS 파일 생성 중 오류가 발생했습니다. (${aasResponse.status})`);
      }

      const responseText = await aasResponse.text();
    } catch (error) {
      throw new Error('AAS 파일 생성 중 오류가 발생했습니다.');
    }

    const [existingAasRows] = await connection.query(
      'SELECT af_idx FROM tb_aasx_file WHERE af_name = ? AND af_kind = ?',
      [oldAasFileName, FILE_KINDS.AAS_KIND]
    );

    if (existingAasRows.length > 0) {
      const updateAasQuery = `UPDATE tb_aasx_file SET af_name = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP WHERE af_name = ? AND af_kind = ?`;
      await connection.query(updateAasQuery, [newAasFileName, user_idx, oldAasFileName, FILE_KINDS.AAS_KIND]);
    } else {
      const insertAasQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, ?, ?, '/files/aas', ?, ?)`;
      const [aasResult] = await connection.query(insertAasQuery, [
        fc_idx,
        FILE_KINDS.AAS_KIND,
        newAasFileName,
        user_idx,
        user_idx,
      ]);
      newAasInsertId = aasResult.insertId;
      createdFiles.push({ type: 'aas', path: `../files/aas/${fileName}`, insertId: newAasInsertId });
    }

    const aasFilePath = `../files/aas/${fileName}`;

    try {
      const aasxResponse = await fetch(`${PYTHON_SERVER_URL}/api/aasx`, {
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
        throw new Error(`AASX 파일 생성 중 오류가 발생했습니다. (${aasxResponse.status})`);
      }

      const responseText = await aasxResponse.text();
    } catch (error) {
      throw new Error('AASX 파일 생성 중 오류가 발생했습니다.');
    }

    const insertAasxQuery = `INSERT INTO tb_aasx_file (fc_idx, af_kind, af_name, af_path, creator, updater) VALUES (?, ?, ?, '/files/aasx', ?, ?)`;
    const [aasxResult] = await connection.query(insertAasxQuery, [
      fc_idx,
      FILE_KINDS.AASX_KIND,
      newAasxFileName,
      user_idx,
      user_idx,
    ]);
    newAasxInsertId = aasxResult.insertId;
    createdFiles.push({ type: 'aasx', path: `../files/aasx/${newAasxFileName}`, insertId: newAasxInsertId });

    const deleteResponse = await fetch(`${PYTHON_SERVER_URL}/api/aas`, {
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
    }

    await connection.query('DELETE FROM tb_aasx_file WHERE af_name = ? AND af_kind = ?', [
      oldAasFileName,
      FILE_KINDS.AAS_KIND,
    ]);
    await connection.query('DELETE FROM tb_aasx_file WHERE af_idx = ? AND af_kind = ?', [af_idx, FILE_KINDS.AASX_KIND]);

    // 트랜잭션 커밋
    await connection.commit();

    return {
      success: true,
      fileName: newAasxFileName,
      filePath: '/files/aasx',
      af_idx: newAasxInsertId,
      message: '변환 완료: AAS JSON, AASX 파일이 모두 업데이트되었습니다.',
    };
  } catch (err) {
    // 트랜잭션 롤백
    if (connection) {
      await connection.rollback();
    }

    await cleanupCreatedFiles(createdFiles);
    throw err;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const deleteFilesFromDB = async (ids) => {
  try {
    const results = await queryMultiple(`select af_idx, af_name, af_kind from tb_aasx_file where af_idx in (?)`, [ids]);

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

      await queryUpdate(`delete from tb_aasx_file where af_name in (?) and af_kind = ?`, [
        aasFileNames,
        FILE_KINDS.AAS_KIND,
      ]);
    }

    if (jsonFiles.length > 0) {
      const jsonFileNames = jsonFiles.map((row) => row.af_name);
      jsonFileNames.forEach((fileName) => {
        deletePaths.push(`../files/front/${fileName}`);
      });
    }

    await queryUpdate(`delete from tb_aasx_file where af_idx in (?)`, [ids]);

    if (deletePaths.length > 0) {
      await deletePythonFiles(deletePaths);
    }

    return {
      success: true,
      message: '파일이 성공적으로 삭제되었습니다.',
      deletedCount: results.length,
      deletedFiles: results.map((file) => file.af_name),
    };
  } catch (err) {
    throw err;
  }
};

export const checkFileSizeFromDB = async (file) => {
  try {
    let af_path = file.af_path;
    let af_name = file.af_name;
    let af_kind = file.af_kind;

    if (!af_path || !af_name || !af_kind) {
      const rows = await queryMultiple('SELECT af_path, af_name, af_kind FROM tb_aasx_file WHERE af_idx = ?', [
        file.af_idx,
      ]);
      if (!rows || rows.length === 0) {
        throw new Error('DB에서 파일 정보를 찾을 수 없습니다.');
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
      fileName = af_name.replace(/\.aasx$/i, '.json');
      filePath = path.join(__dirname, '../../../../files/aas', fileName);
    }

    if (!fs.existsSync(filePath)) {
      throw new Error('해당하는 파일이 존재하지 않습니다.');
    }

    const fileStats = fs.statSync(filePath);

    return {
      size: fileStats.size,
      fileName: fileName,
      filePath: filePath,
      isLargeFile: fileStats.size > FILE.MAX_SIZE,
    };
  } catch (error) {
    throw error;
  }
};

export const getVerifyFromDB = async (file) => {
  try {
    let af_path = file.af_path;
    let af_name = file.af_name;
    let af_kind = file.af_kind;

    if (!af_path || !af_name || !af_kind) {
      const rows = await queryMultiple('SELECT af_path, af_name, af_kind FROM tb_aasx_file WHERE af_idx = ?', [
        file.af_idx,
      ]);
      if (!rows || rows.length === 0) {
        throw new Error('DB에서 파일 정보를 찾을 수 없습니다.');
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
        throw new Error('AASX 파일이 존재하지 않습니다.');
      }
    }

    if (!fs.existsSync(filePath)) {
      throw new Error('해당하는 파일이 존재하지 않습니다.');
    }

    const fileStats = fs.statSync(filePath);

    if (fileStats.size > FILE.MAX_SIZE) {
      throw new Error('FILE_TOO_LARGE');
    }

    const fileData = fs.readFileSync(filePath, 'utf8');

    if (!fileData || fileData.trim() === '') {
      throw new Error('파일이 비어있습니다.');
    }

    const trimmedStart = fileData.trim();
    if (!trimmedStart.startsWith('{') && !trimmedStart.startsWith('[')) {
      throw new Error('유효하지 않은 JSON 파일입니다.');
    }

    const jsonData = JSON.parse(fileData);

    if (af_kind === FILE_KINDS.JSON_KIND) {
      return {
        aasData: jsonData,
        jsonFile: {
          name: fileName,
          path: '/files/front',
        },
        fileSize: fileStats.size,
      };
    } else {
      const aasxFilePath = path.join(__dirname, '../../../../', af_path, af_name);
      const aasxFileData = fs.readFileSync(aasxFilePath);

      if (!aasxFileData || aasxFileData.length === 0) {
        throw new Error('AASX 파일이 비어있습니다.');
      }

      return {
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
      };
    }
  } catch (error) {
    throw error;
  }
};

export const getWordsFromDB = async (fc_idx) => {
  const results = await queryMultiple(
    'select as_kr, as_en, createdAt, updatedAt from tb_aasx_alias order by as_idx desc'
  );

  if (results.length === 0) {
    return null;
  }

  return results.map((word) => ({
    as_kr: word.as_kr,
    as_en: word.as_en,
    createdAt: word.createdAt,
    updatedAt: word.updatedAt,
  }));
};

export const getSearchFromDB = async (fc_idx, type, text) => {
  let column;
  if (type === 'kr') column = 'as_kr';
  else if (type === 'en') column = 'as_en';
  else throw new Error('Invalid type');

  const query = `SELECT as_kr, as_en FROM tb_aasx_alias WHERE ${column} LIKE ? order by as_idx desc`;
  const searchText = `%${text}%`;

  const results = await queryMultiple(query, [searchText]);

  if (results.length === 0) {
    return null;
  }

  return results.map((word) => ({
    as_kr: word.as_kr,
    as_en: word.as_en,
  }));
};

export const updateWordsToDB = async (updates) => {
  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    throw new Error('업데이트할 데이터가 없습니다.');
  }

  const updatePromises = updates.map(async (update) => {
    const { as_kr, original_as_en, new_as_en } = update;

    if (!as_kr) {
      throw new Error('필수 필드가 누락되었습니다.');
    }

    let query, params;
    if (original_as_en === null) {
      query = `UPDATE tb_aasx_alias SET as_en = ? WHERE as_kr = ? AND as_en IS NULL`;
      params = [new_as_en || null, as_kr];
    } else {
      query = `UPDATE tb_aasx_alias SET as_en = ? WHERE as_kr = ? AND as_en = ?`;
      params = [new_as_en || null, as_kr, original_as_en];
    }

    const result = await queryUpdate(query, params);
    return { as_kr, original_as_en, new_as_en, affectedRows: result.affectedRows };
  });

  const results = await Promise.all(updatePromises);

  return {
    success: true,
    updatedCount: results.length,
    results: results,
  };
};
