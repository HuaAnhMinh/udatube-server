import LogRole from "./LogRole";

export default {
  Type: 'AWS::IAM::Role',
  Properties: {
    RoleName: 'GetVideosRole',
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
      PolicyName: 'GetVideosRolePolicy',
      PolicyDocument: {
        Version: '2012-10-17',
        Statement: [...LogRole, {
          Effect: 'Allow',
          Action: [
            'dynamodb:Scan',
            'dynamodb:Query',
          ],
          Resource: [
            'arn:aws:dynamodb:us-east-1:*:table/${self:provider.environment.VIDEOS_TABLE}',
          ],
        }, {
          Effect: 'Allow',
          Action: [
            'dynamodb:Query',
          ],
          Resource: [
            'arn:aws:dynamodb:us-east-1:*:table/${self:provider.environment.VIDEOS_TABLE}/index/${self:provider.environment.VIDEOS_TABLE_INDEX}',
          ],
        }, {
          Effect: 'Allow',
          Action: [
            'dynamodb:GetItem',
          ],
          Resource: [
            'arn:aws:dynamodb:us-east-1:*:table/${self:provider.environment.USERS_TABLE}',
          ],
        }],
      },
    }],
  },
};