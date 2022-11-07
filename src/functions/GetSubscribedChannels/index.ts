import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'GetSubscribedChannelsRole',
  name: 'udatube-GetSubscribedChannels',
  events: [{
    http: {
      method: 'get',
      path: '/users/{id}/subscribed-channels',
      cors: true,
      authorizer: {
        name: 'Authorizer',
      },
    },
  }],
};
