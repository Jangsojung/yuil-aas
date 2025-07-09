import { insertConvertsToDB } from '../../service/convert/ConvertService.js';
import { successResponse, internalServerError } from '../../utils/responseHandler.js';

export const insertConverts = async (fc_idx, startDate, endDate, selectedConvert, user_idx, af_kind, res) => {
  try {
    const result = await insertConvertsToDB(null, startDate, endDate, selectedConvert, user_idx, af_kind);
    successResponse(res, result);
  } catch (err) {
    internalServerError(res);
  }
};
