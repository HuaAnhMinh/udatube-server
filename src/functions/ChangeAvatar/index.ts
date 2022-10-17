import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'ChangeAvatarRole',
  name: 'udatube-ChangeAvatar',
  events: [{
    http: {
      method: 'patch',
      path: 'users/me/avatar',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
    },
  }],
};
