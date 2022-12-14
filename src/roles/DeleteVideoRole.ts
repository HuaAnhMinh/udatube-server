import LogRole from "./LogRole";

export default {
  Type: 'AWS::IAM::Role',
  Properties: {
    RoleName: 'DeleteVideoRole',
    AssumeRolePolicyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: {
          Service: 'lambda.amazonaws.com',
        },
        Action: 'sts:AssumeRole',
      }],
    },
    Policies: [{
      PolicyName: 'DeleteVideoRolePolicy',
      PolicyDocument: {
        Version: '2012-10-17',
        Statement: [...LogRole, {
          Effect: 'Allow',
          Action: [
            'dynamodb:GetItem',
            'dynamodb:UpdateItem',
          ],
          Resource: [
            'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.USERS_TABLE}',
          ],
        }, {
          Effect: 'Allow',
          Action: [
            'dynamodb:DeleteItem',
            'dynamodb:GetItem',
          ],
          Resource: [
            'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.VIDEOS_TABLE}',
          ],
        }, {
          Effect: 'Allow',
          Action: [
            's3:DeteleObject',
          ],
          Resource: [
            'arn:aws:s3:::${self:provider.environment.THUMBNAILS_BUCKET}/*',
            'arn:aws:s3:::${self:provider.environment.VIDEOS_BUCKET}/*',
          ],
        }, {
          Effect: 'Allow',
          Action: [
            'dynamodb:Scan',
            'dynamodb:DeleteItem',
          ],
          Resource: [
            'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.COMMENTS_TABLE}',
          ],
        }, {
          Effect: 'Allow',
          Action: [
            'dynamodb:Query',
          ],
          Resource: [
            'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.COMMENTS_TABLE}',
            'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.COMMENTS_TABLE}/index/${self:provider.environment.COMMENTS_TABLE_INDEX}'
          ],
        }],
      },
    }],
  },
};