import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'ViewProfileRole',
  name: 'udatube-ViewProfile',
  events: [{
    http: {
      method: 'get',
      path: 'users/{id}',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
    },
  }],
};
