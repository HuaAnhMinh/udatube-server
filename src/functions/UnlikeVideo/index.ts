import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'ReactVideoRole',
  name: 'udatube-UnlikeVideo',
  events: [{
    http: {
      method: 'post',
      path: 'videos/{id}/unlike',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
    },
  }],
};
