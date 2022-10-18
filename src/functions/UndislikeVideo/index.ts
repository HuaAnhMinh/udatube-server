import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'ReactVideoRole',
  name: 'udatube-UndislikeVideo',
  events: [{
    http: {
      method: 'post',
      path: 'videos/{id}/undislike',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
    },
  }],
};
