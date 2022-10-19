import {handlerPath} from '@libs/handler-resolver';
import schema from "./schema";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'UpdateCommentRole',
  name: 'udatube-UpdateComment',
  events: [{
    http: {
      method: 'patch',
      path: 'comments/{id}',
      cors: true,
      authorizer: {
        name: 'Authorizer',
      },
      request: {
        schemas: {
          'application/json': schema,
        },
      },
    },
  }],
};
