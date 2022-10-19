import {handlerPath} from '@libs/handler-resolver';
import schema from "./schema";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'CreateCommentRole',
  name: 'udatube-CreateComment',
  events: [{
    http: {
      method: 'post',
      path: 'comments',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
      request: {
        schemas: {
          'application/json': schema,
        },
      },
    },
  }],
};
