import LogRole from "./LogRole";

export default {
  Type: 'AWS::IAM::Role',
  Properties: {
    RoleName: 'DeleteCommentRole',
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
      PolicyName: 'DeleteCommentRolePolicy',
      PolicyDocument: {
        Version: '2012-10-17',
        Statement: [...LogRole, {
          Effect: 'Allow',
          Action: [
            'dynamodb:GetItem',
          ],
          Resource: [
            'arn:aws:dynamodb:us-east-1:*:table/${self:provider.environment.USERS_TABLE}',
            'arn:aws:dynamodb:us-east-1:*:table/${self:provider.environment.COMMENTS_TABLE}',
          ],
        }, {
          Effect: 'Allow',
          Action: [
            'dynamodb:DeleteItem',
          ],
          Resource: [
            'arn:aws:dynamodb:us-east-1:*:table/${self:provider.environment.COMMENTS_TABLE}',
          ],
        }],
      },
    }],
  },
};