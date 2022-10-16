import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'UnsubscribeChannelRole',
  name: 'udatube-UnsubscribeChannel',
  events: [{
    http: {
      method: 'post',
      path: 'users/{id}/unsubscribe',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
    },
  }],
};
