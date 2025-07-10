import { createRouter, extractors } from '../../utils/routerHelper.js';
import { getUser } from '../../controller/signin/SignInController.js';

const routes = [
  {
    method: 'post',
    path: '/',
    controller: getUser,
    extractor: extractors.fromBody(['email', 'password']),
  },
];

export default createRouter(routes);
