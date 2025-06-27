import { insertConvertsToDB } from '../../service/convert/ConvertService.js';

export const insertConverts = async (fc_idx, startDate, endDate, selectedConvert, user_idx, res) => {
  try {
    const result = await insertConvertsToDB(fc_idx, startDate, endDate, selectedConvert, user_idx);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};
