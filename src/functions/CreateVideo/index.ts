import {handlerPath} from '@libs/handler-resolver';
import schema from "./schema";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'CreateVideoRole',
  name: 'udatube-CreateVideo',
  events: [{
    http: {
      method: 'post',
      path: 'videos',
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
