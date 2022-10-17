import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'UploadVideoRole',
  name: 'udatube-UploadVideo',
  events: [{
    http: {
      method: 'patch',
      path: 'videos/{id}/video',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
    },
  }],
};
