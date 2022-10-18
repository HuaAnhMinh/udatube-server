import {handlerPath} from '@libs/handler-resolver';
import schema from "./schema";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'UpdateVideoRole',
  name: 'udatube-UpdateVideo',
  events: [{
    http: {
      method: 'patch',
      path: 'videos/{id}',
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
