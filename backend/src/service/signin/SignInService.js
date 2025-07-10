import { pool } from '../../config/database.js';
import crypto from 'crypto';
import { validateJWTSecret } from '../../config/validation.js';

const JWT_SECRET = validateJWTSecret();

export const getUserFromDB = async (email, password) => {
  try {
    // 파라미터 검증
    const validatedEmail = email && email !== null && email !== undefined ? email : null;
    const validatedPassword = password && password !== null && password !== undefined ? password : null;

    const query = 'select user_idx, user_id, user_pw, user_name, cm_idx from tb_user_info where user_id = ?';

    const [results] = await pool.promise().query(query, [validatedEmail]);

    if (results.length === 0) {
      return { success: false, message: '사용자를 찾을 수 없습니다.' };
    }

    const user = results[0];
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

    if (hashedPassword === user.user_pw) {
      return {
        success: true,
        user_idx: user.user_idx,
        user_id: user.user_id,
        user_name: user.user_name,
        cm_idx: user.cm_idx,
      };
    } else {
      return { success: false, message: '비밀번호가 틀렸습니다.' };
    }
  } catch (err) {
    throw err;
  }
};
