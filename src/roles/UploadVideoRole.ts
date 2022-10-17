import LogRole from "./LogRole";

export default {
  Type: 'AWS::IAM::Role',
  Properties: {
    RoleName: 'UploadVideoRole',
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
      PolicyName: 'UploadVideoRolePolicy',
      PolicyDocument: {
        Version: '2012-10-17',
        Statement: [...LogRole, {
          Effect: 'Allow',
          Action: [
            'dynamodb:GetItem',
          ],
          Resource: [
            'arn:aws:dynamodb:us-east-1:*:table/${self:provider.environment.VIDEOS_TABLE}',
            'arn:aws:dynamodb:us-east-1:*:table/${self:provider.environment.USERS_TABLE}',
          ],
        }, {
          Effect: 'Allow',
          Action: [
            's3:PutObject',
          ],
          Resource: [
            'arn:aws:s3:::${self:provider.environment.VIDEOS_BUCKET}/*',
          ],
        }],
      },
    }],
  },
};