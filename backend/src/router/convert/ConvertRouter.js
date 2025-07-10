import { createRouter, extractors } from '../../utils/routerHelper.js';
import { insertConverts } from '../../controller/convert/ConvertController.js';

const routes = [
  {
    method: 'post',
    path: '/',
    controller: insertConverts,
    extractor: extractors.fromBody(['fc_idx', 'user_idx', 'startDate', 'endDate', 'selectedConvert', 'af_kind']),
  },
];

export default createRouter(routes);
