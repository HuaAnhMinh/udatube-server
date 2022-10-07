import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'RegisterRole',
  name: 'udatube-Register',
  events: [{
    http: {
      method: 'post',
      path: 'users',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
    },
  }],
};
