import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'ReactVideoRole',
  name: 'udatube-DislikeVideo',
  events: [{
    http: {
      method: 'post',
      path: 'videos/{id}/dislike',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
    },
  }],
};
