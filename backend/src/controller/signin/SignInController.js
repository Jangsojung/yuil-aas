import { getUserFromDB } from '../../service/signin/SignInService.js';

export const getUser = async (email, password, res) => {
  try {
    const result = await getUserFromDB(email, password);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ err: 'Internal Server Error' });
  }
};
