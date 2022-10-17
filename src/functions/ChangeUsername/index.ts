import {handlerPath} from '@libs/handler-resolver';
import schema from "./schema";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'ChangeUsernameRole',
  name: 'udatube-ChangeUsername',
  events: [{
    http: {
      method: 'patch',
      path: 'users/me',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
      request: {
        schemas: {
          'application/json': schema
        }
      },
    },
  }],
};
