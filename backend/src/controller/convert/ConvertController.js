import { insertConvertsToDB } from '../../service/convert/ConvertService.js';

export const insertConverts = async (fc_idx, startDate, endDate, selectedConvert, user_idx, af_kind, res) => {
  try {
    const result = await insertConvertsToDB(null, startDate, endDate, selectedConvert, user_idx, af_kind);

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: true,
      message: err.message || 'Internal Server Error',
    });
  }
};
