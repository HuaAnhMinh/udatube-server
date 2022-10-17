import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'SearchUserRole',
  name: 'udatube-SearchUser',
  events: [{
    http: {
      method: 'get',
      path: 'users',
      cors: true,
    },
  }],
};
