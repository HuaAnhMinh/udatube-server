import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'ReactVideoRole',
  name: 'udatube-LikeVideo',
  events: [{
    http: {
      method: 'post',
      path: 'videos/{id}/like',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
    },
  }],
};
