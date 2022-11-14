import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'ResizeThumbnailRole',
  name: 'udatube-ResizeThumbnail',
  events: [{
    sns: {
      topicName: '${self:provider.environment.VIDEOS_TOPIC}',
      arn: {
        'Fn::Join': [
          ':',
          [
            'arn:aws:sns',
            {
              Ref: 'AWS::Region',
            },
            {
              Ref: 'AWS::AccountId',
            },
            '${self:provider.environment.VIDEOS_TOPIC}',
          ],
        ],
      },
    },
  }],
};