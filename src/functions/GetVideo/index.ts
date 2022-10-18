import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'GetVideoRole',
  name: 'udatube-GetVideo',
  events: [{
    http: {
      method: 'get',
      path: 'videos/{id}',
      cors: true,
    },
  }],
};
