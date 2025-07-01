import { pool } from '../../index.js';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const getUserFromDB = async (email, password) => {
  return new Promise((resolve, reject) => {
    const query = 'select user_idx, user_id, user_pw, user_name, cm_idx from tb_user_info where user_id = ?';

    pool.query(query, [email], async (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      if (results.length === 0) {
        resolve({ success: false, message: '사용자를 찾을 수 없습니다.' });
        return;
      }

      const user = results[0];
      const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

      if (hashedPassword === user.user_pw) {
        resolve({
          success: true,
          user_idx: user.user_idx,
          user_id: user.user_id,
          user_name: user.user_name,
          cm_idx: user.cm_idx,
        });
      } else {
        resolve({ success: false, message: '비밀번호가 틀렸습니다.' });
      }
    });
  });
};
