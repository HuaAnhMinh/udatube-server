import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'GetCommentsRole',
  name: 'udatube-GetComments',
  events: [{
    http: {
      method: 'get',
      path: 'comments',
      cors: true,
    },
  }],
};
