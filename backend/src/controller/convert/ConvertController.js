import { insertConvertsToDB } from '../../service/convert/ConvertService.js';
import { successResponse, errorResponse } from '../../utils/responseHandler.js';

export const insertConverts = async (fc_idx, user_idx, startDate, endDate, selectedConvert, af_kind, res) => {
  try {
    const result = await insertConvertsToDB(fc_idx, user_idx, startDate, endDate, selectedConvert, af_kind);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};
