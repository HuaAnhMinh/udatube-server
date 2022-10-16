import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'SubscribeChannelRole',
  name: 'udatube-SubscribeChannel',
  events: [{
    http: {
      method: 'post',
      path: 'users/{id}/subscribe',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
    },
  }],
};
