import { getFactoriesFromDB, getBaseCodeFromDB } from '../../service/basic_code/BasicCodeService.js';

export const getFactories = async (res) => {
  try {
    const result = await getFactoriesFromDB();

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};

export const getBaseCode = async (fc_idx, res) => {
  try {
    const result = await getBaseCodeFromDB(fc_idx);

    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ err: 'Internal Server Error' });
  }
};
