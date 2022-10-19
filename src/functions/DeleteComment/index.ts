import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'DeleteCommentRole',
  name: 'udatube-DeleteComment',
  events: [{
    http: {
      method: 'delete',
      path: 'comments/{id}',
      cors: true,
      authorizer: {
        name: 'Authorizer',
      },
    },
  }],
};
