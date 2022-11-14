import {handlerPath} from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  role: 'ResizeAvatarRole',
  name: 'udatube-ResizeAvatar',
  events: [{
    sns: {
      topicName: '${self:provider.environment.AVATARS_TOPIC}',
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
            '${self:provider.environment.AVATARS_TOPIC}',
          ],
        ],
      },
    },
  }],
};