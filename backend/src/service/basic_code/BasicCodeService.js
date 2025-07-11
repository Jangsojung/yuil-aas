import { validateValue } from '../../utils/validation.js';
import { querySingle, queryMultiple, queryInsert, queryUpdate, withTransaction } from '../../utils/dbHelper.js';

export const getBaseByIdFromDB = async (ab_idx) => {
  const validatedAbIdx = validateValue(ab_idx);

  const query = `
    SELECT b.ab_idx, b.ab_name, b.ab_note, b.fc_idx, b.createdAt, b.updatedAt 
    FROM tb_aasx_base b
    WHERE b.ab_idx = ?
  `;

  return await querySingle(query, [validatedAbIdx]);
};

export const getBaseFCIdxFromDB = async (ab_idx) => {
  const validatedAbIdx = validateValue(ab_idx);

  const result = await querySingle('SELECT fc_idx FROM tb_aasx_base WHERE ab_idx = ? LIMIT 1', [validatedAbIdx]);
  return result ? result.fc_idx : null;
};

export const getBasesFromDB = async (fc_idx) => {
  const validatedFcIdx = validateValue(fc_idx);

  let query = '';
  let params = [];
  if (validatedFcIdx === -1 || validatedFcIdx === null) {
    query = `
        SELECT DISTINCT b.ab_idx, b.ab_name, b.ab_note, COUNT(bs.sn_idx) as sn_length, b.createdAt, b.updatedAt, a.fc_idx, d.fc_name
        FROM tb_aasx_base b
        JOIN tb_aasx_base_sensor bs ON b.ab_idx = bs.ab_idx
        JOIN tb_aasx_data_prop p ON bs.sn_idx = p.sn_idx
        JOIN tb_aasx_data_sm s ON p.fa_idx = s.fa_idx
        JOIN tb_aasx_data_aas a ON s.fg_idx = a.fg_idx
        JOIN tb_aasx_data d ON a.fc_idx = d.fc_idx
        GROUP BY b.ab_idx, b.ab_name, b.ab_note, b.createdAt, b.updatedAt, a.fc_idx, d.fc_name
        ORDER BY b.ab_idx DESC
      `;
  } else {
    query = `
        SELECT DISTINCT b.ab_idx, b.ab_name, b.ab_note, COUNT(bs.sn_idx) as sn_length, b.createdAt, b.updatedAt, a.fc_idx, d.fc_name
        FROM tb_aasx_base b
        JOIN tb_aasx_base_sensor bs ON b.ab_idx = bs.ab_idx
        JOIN tb_aasx_data_prop p ON bs.sn_idx = p.sn_idx
        JOIN tb_aasx_data_sm s ON p.fa_idx = s.fa_idx
        JOIN tb_aasx_data_aas a ON s.fg_idx = a.fg_idx
        JOIN tb_aasx_data d ON a.fc_idx = d.fc_idx
        WHERE a.fc_idx = ?
        GROUP BY b.ab_idx, b.ab_name, b.ab_note, b.createdAt, b.updatedAt, a.fc_idx, d.fc_name
        ORDER BY b.ab_idx DESC
      `;
    params.push(validatedFcIdx);
  }

  const results = await queryMultiple(query, params);

  if (results.length === 0) {
    return [];
  }

  // fc_idx, fc_name 정보 추가
  const bases = results.map((base) => {
    return {
      ab_idx: base.ab_idx,
      ab_name: base.ab_name,
      ab_note: base.ab_note,
      fc_idx: base.fc_idx,
      fc_name: base.fc_name,
      sn_length: base.sn_length,
      createdAt: base.createdAt,
      updatedAt: base.updatedAt,
    };
  });

  return bases;
};

export const insertBasesToDB = async (name, note, ids, user_idx, fc_idx) => {
  const result = await queryInsert(
    'insert into tb_aasx_base (ab_name, ab_note, creator, updater, fc_idx) values (?, ?, ?, ?, ?)',
    [name, note || null, user_idx, user_idx, fc_idx]
  );

  const ab_idx = result.insertId;

  const values = ids.map((id) => [ab_idx, id]);
  await queryInsert('insert into tb_aasx_base_sensor (ab_idx, sn_idx) values ?', [values]);

  return {
    ab_idx,
    ab_name: name,
    ab_note: note,
  };
};

export const updateBaseToDB = async (ab_idx, name, note, ids, user_idx) => {
  return await withTransaction(async (connection) => {
    await connection.query(
      `update tb_aasx_base set ab_name = ?, ab_note = ?, updater = ?, updatedAt = CURRENT_TIMESTAMP where ab_idx = ?`,
      [name, note || null, user_idx, ab_idx]
    );
    await connection.query(`delete from tb_aasx_base_sensor where ab_idx = ?`, [ab_idx]);

    if (ids.length > 0) {
      const values = ids.map((id) => [ab_idx, id]);
      await connection.query(`insert into tb_aasx_base_sensor (ab_idx, sn_idx) values ?`, [values]);
    }

    return {
      ab_idx,
      ab_name: name,
      ab_note: note,
    };
  });
};

export const deleteBasesFromDB = async (ids) => {
  await queryUpdate('delete from tb_aasx_base_sensor where ab_idx in (?)', [ids]);
  await queryUpdate('delete from tb_aasx_base where ab_idx in (?)', [ids]);

  return { success: true, message: 'Bases deleted successfully' };
};

export const getSelectedSensorsFromDB = async (ab_idx) => {
  const results = await queryMultiple('select sn_idx from tb_aasx_base_sensor where ab_idx = ?', [ab_idx]);

  if (results.length === 0) {
    return null;
  }

  return results.map((sensor) => ({
    sn_idx: sensor.sn_idx,
  }));
};

export const getFacilityGroupsFromDB = async (fc_idx, order = 'asc') => {
  // order 파라미터가 null인 경우 기본값 사용
  const validOrder = order || 'asc';

  let query;
  let params = [];

  if (fc_idx === -1 || fc_idx === null) {
    // 전체 설비그룹 조회
    query = `select fg_idx, fg_name, fc_idx, origin_check from tb_aasx_data_aas order by fg_idx ${validOrder}`;
  } else {
    // 특정 공장의 설비그룹 조회
    query = `select fg_idx, fg_name, fc_idx, origin_check from tb_aasx_data_aas where fc_idx = ? order by fg_idx ${validOrder}`;
    params = [fc_idx];
  }

  const results = await queryMultiple(query, params);

  if (results.length === 0) {
    return null;
  }

  const facilityGroups = results.map((facilityGroup) => {
    return {
      fg_idx: facilityGroup.fg_idx,
      fg_name: facilityGroup.fg_name,
      fc_idx: facilityGroup.fc_idx,
      origin_check: facilityGroup.origin_check || -1,
    };
  });

  return facilityGroups;
};

export const getSensorsFromDB = async (fa_idx) => {
  const query = 'select sn_idx, sn_name, origin_check from tb_aasx_data_prop where fa_idx = ?';

  const results = await queryMultiple(query, [fa_idx]);

  if (results.length === 0) {
    return null;
  }

  const sensors = results.map((sensor) => {
    return {
      sn_idx: sensor.sn_idx,
      sn_name: sensor.sn_name,
      origin_check: sensor.origin_check || -1,
    };
  });

  return sensors;
};

export const getBaseCodeFromDB = async (fg_idx) => {
  const query = `SELECT fa_idx, fa_name, origin_check from tb_aasx_data_sm where fg_idx = ?`;

  const results = await queryMultiple(query, [fg_idx]);

  if (results.length === 0) {
    return null;
  }

  const basics = results.map((basic) => {
    return {
      fa_idx: basic.fa_idx,
      fa_name: basic.fa_name,
      origin_check: basic.origin_check || -1,
    };
  });

  return basics;
};

export const getAllSensorsInGroupFromDB = async (fg_idx) => {
  const query = `
    SELECT p.sn_idx, p.sn_name, p.origin_check 
    FROM tb_aasx_data_prop p
    JOIN tb_aasx_data_sm s ON p.fa_idx = s.fa_idx
    WHERE s.fg_idx = ?
  `;

  const results = await queryMultiple(query, [fg_idx]);

  if (results.length === 0) {
    return null;
  }

  const sensors = results.map((sensor) => {
    return {
      sn_idx: sensor.sn_idx,
      sn_name: sensor.sn_name,
      origin_check: sensor.origin_check || -1,
    };
  });

  return sensors;
};

export const getFactoriesByCmIdxFromDB = async (cm_idx) => {
  // tb_aasx_data에서 공장 목록 조회 (외래키 제약 조건을 만족하기 위해)
  const query = `
    SELECT DISTINCT a.fc_idx, a.fc_name, a.origin_check
    FROM tb_aasx_data a
    INNER JOIN tb_factory_info f ON a.fc_idx = f.fc_idx
    WHERE f.cm_idx = ? 
    ORDER BY a.fc_idx
  `;

  const results = await queryMultiple(query, [cm_idx]);

  if (results.length === 0) {
    return null;
  }

  const factories = results.map((factory) => {
    return {
      fc_idx: factory.fc_idx,
      fc_name: factory.fc_name,
      origin_check: factory.origin_check || -1,
    };
  });

  return factories;
};

// 공장 추가
export const insertFactoryToDB = async (cm_idx, fc_name) => {
  return await withTransaction(async (connection) => {
    // 최대 fc_idx 조회 (두 테이블 중 더 큰 값 사용)
    const maxFactoryQuery = 'SELECT MAX(fc_idx) as max_fc_idx FROM tb_factory_info';
    const maxAasxQuery = 'SELECT MAX(fc_idx) as max_fc_idx FROM tb_aasx_data';

    const [maxFactoryResult] = await connection.query(maxFactoryQuery);
    const [maxAasxResult] = await connection.query(maxAasxQuery);

    const maxFactoryIdx = maxFactoryResult[0].max_fc_idx || 0;
    const maxAasxIdx = maxAasxResult[0].max_fc_idx || 0;
    const nextFcIdx = Math.max(maxFactoryIdx, maxAasxIdx) + 1;

    // tb_aasx_data에 먼저 공장 정보 추가 (외래키 제약 조건을 위해)
    await connection.query('INSERT INTO tb_aasx_data (fc_idx, fc_name, origin_check) VALUES (?, ?, ?)', [
      nextFcIdx,
      fc_name,
      0,
    ]);

    // tb_factory_info에 공장 추가
    await connection.query('INSERT INTO tb_factory_info (cm_idx, fc_idx, fc_name) VALUES (?, ?, ?)', [
      cm_idx,
      nextFcIdx,
      fc_name,
    ]);

    return {
      success: true,
      fc_idx: nextFcIdx,
      fc_name: fc_name,
      message: '공장이 성공적으로 추가되었습니다.',
    };
  });
};

// 설비그룹 추가
export const insertFacilityGroupToDB = async (fc_idx, fg_name) => {
  return await withTransaction(async (connection) => {
    // 최대 fg_idx 조회
    const maxQuery = 'SELECT MAX(fg_idx) as max_fg_idx FROM tb_aasx_data_aas';
    const [maxResult] = await connection.query(maxQuery);
    const nextFgIdx = (maxResult[0].max_fg_idx || 0) + 1;

    // 설비그룹 추가
    await connection.query('INSERT INTO tb_aasx_data_aas (fc_idx, fg_idx, fg_name, origin_check) VALUES (?, ?, ?, ?)', [
      fc_idx,
      nextFgIdx,
      fg_name,
      0,
    ]);

    return {
      success: true,
      fg_idx: nextFgIdx,
      fg_name: fg_name,
      message: '설비그룹이 성공적으로 추가되었습니다.',
    };
  });
};

// 설비 추가
export const insertFacilityToDB = async (fg_idx, fa_name) => {
  return await withTransaction(async (connection) => {
    // 최대 fa_idx 조회
    const maxQuery = 'SELECT MAX(fa_idx) as max_fa_idx FROM tb_aasx_data_sm';
    const [maxResult] = await connection.query(maxQuery);
    const nextFaIdx = (maxResult[0].max_fa_idx || 0) + 1;

    // 설비 추가
    await connection.query('INSERT INTO tb_aasx_data_sm (fg_idx, fa_idx, fa_name, origin_check) VALUES (?, ?, ?, ?)', [
      fg_idx,
      nextFaIdx,
      fa_name,
      0,
    ]);

    return {
      success: true,
      fa_idx: nextFaIdx,
      fa_name: fa_name,
      message: '설비가 성공적으로 추가되었습니다.',
    };
  });
};

// 센서 추가
export const insertSensorToDB = async (fa_idx, sn_name) => {
  return await withTransaction(async (connection) => {
    // 최대 sn_idx 조회
    const maxQuery = 'SELECT MAX(sn_idx) as max_sn_idx FROM tb_aasx_data_prop';
    const [maxResult] = await connection.query(maxQuery);
    const nextSnIdx = (maxResult[0].max_sn_idx || 0) + 1;

    // 센서 추가
    await connection.query(
      'INSERT INTO tb_aasx_data_prop (fa_idx, sn_idx, sn_name, origin_check) VALUES (?, ?, ?, ?)',
      [fa_idx, nextSnIdx, sn_name, 0]
    );

    return {
      success: true,
      sn_idx: nextSnIdx,
      sn_name: sn_name,
      message: '센서가 성공적으로 추가되었습니다.',
    };
  });
};

// 기존 공장들을 tb_aasx_data에 동기화
export const syncFactoriesToAasxData = async () => {
  const query = `
    INSERT INTO tb_aasx_data (fc_idx, fc_name)
    SELECT DISTINCT fc_idx, fc_name
    FROM tb_aasx_data_aas
    WHERE fc_idx NOT IN (SELECT fc_idx FROM tb_aasx_data)
  `;

  const result = await queryInsert(query);

  return {
    success: true,
    message: '공장 동기화가 완료되었습니다.',
    insertedCount: result.affectedRows,
  };
};

export const getSensorValuesFromDB = async (sensorIds) => {
  if (!sensorIds || sensorIds.length === 0) {
    return [];
  }

  // 임시로 더미 데이터 반환
  const dummyValues = sensorIds.map((sn_idx, index) => ({
    sn_idx: sn_idx,
    sn_name: `센서${sn_idx}`,
    sn_value: Math.floor(Math.random() * 100) + 20, // 20-120 사이의 랜덤 값
    sn_unit: index % 3 === 0 ? '°C' : index % 3 === 1 ? 'Pa' : 'rpm',
    sn_timestamp: new Date().toISOString(),
  }));

  return dummyValues;
};
