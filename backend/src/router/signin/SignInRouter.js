import express from 'express';
import { getUser } from '../../controller/signin/SignInController.js';

const router = express.Router();

export default () => {
  router.post('/', (req, res) => {
    const { email, password } = req.body;

    getUser(email, password, res);
  });

  return router;
};
