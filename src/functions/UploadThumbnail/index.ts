import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'UploadThumbnailRole',
  name: 'udatube-UploadThumbnail',
  events: [{
    http: {
      method: 'patch',
      path: 'videos/{id}/thumbnail',
      authorizer: {
        name: 'Authorizer',
      },
      cors: true,
    },
  }],
};
