import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'DeleteVideoRole',
  name: 'udatube-DeleteVideo',
  events: [{
    http: {
      method: 'delete',
      path: 'videos/{id}',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
    },
  }],
};
