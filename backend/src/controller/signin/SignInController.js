import { getUserFromDB } from '../../service/signin/SignInService.js';

export const getUser = async (email, password, res) => {
  try {
    const result = await getUserFromDB(email, password);
    if (result.success) {
      // 성공 시 사용자 정보를 직접 반환 (data로 감싸지 않음)
      res.status(200).json(result);
    } else {
      // 실패 시 에러 메시지 반환
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || '서버 오류가 발생했습니다.' });
  }
};
