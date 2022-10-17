import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'GetVideosRole',
  name: 'udatube-GetVideos',
  events: [{
    http: {
      method: 'get',
      path: 'videos',
      cors: true,
    },
  }],
};
