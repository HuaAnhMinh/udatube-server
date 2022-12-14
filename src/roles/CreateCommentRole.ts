import LogRole from "./LogRole";

export default {
  Type: 'AWS::IAM::Role',
  Properties: {
    RoleName: 'CreateCommentRole',
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
      PolicyName: 'CreateCommentRolePolicy',
      PolicyDocument: {
        Version: '2012-10-17',
        Statement: [...LogRole, {
          Effect: 'Allow',
          Action: [
            'dynamodb:GetItem',
          ],
          Resource: [
            'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.USERS_TABLE}',
            'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.VIDEOS_TABLE}',
          ],
        }, {
          Effect: 'Allow',
          Action: [
            'dynamodb:PutItem',
          ],
          Resource: [
            'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.COMMENTS_TABLE}',
          ],
        }],
      },
    }],
  },
};