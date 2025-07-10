import crypto from 'crypto';
import { validateJWTSecret } from '../../config/validation.js';
import { validateValue } from '../../utils/validation.js';
import { querySingle } from '../../utils/dbHelper.js';

const JWT_SECRET = validateJWTSecret();

export const getUserFromDB = async (email, password) => {
  // 파라미터 검증
  const validatedEmail = validateValue(email);
  const validatedPassword = validateValue(password);

  const user = await querySingle(
    'select user_idx, user_id, user_pw, user_name, cm_idx from tb_user_info where user_id = ?',
    [validatedEmail]
  );

  if (!user) {
    return { success: false, message: '사용자를 찾을 수 없습니다.' };
  }

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
};
