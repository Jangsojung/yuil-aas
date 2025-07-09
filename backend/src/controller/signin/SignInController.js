import { getUserFromDB } from '../../service/signin/SignInService.js';
import { successResponse, internalServerError } from '../../utils/responseHandler.js';

export const getUser = async (email, password, res) => {
  try {
    const result = await getUserFromDB(email, password);
    successResponse(res, result);
  } catch (err) {
    internalServerError(res);
  }
};
