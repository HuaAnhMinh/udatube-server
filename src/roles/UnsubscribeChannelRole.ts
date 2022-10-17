import LogRole from "./LogRole";

const UnsubscribeChannelRole = {
  Type: 'AWS::IAM::Role',
  Properties: {
    RoleName: 'UnsubscribeChannelRole',
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
      PolicyName: 'UnsubscribeChannelRolePolicy',
      PolicyDocument: {
        Version: '2012-10-17',
        Statement: [...LogRole, {
          Effect: 'Allow',
          Action: [
            'dynamodb:GetItem',
            'dynamodb:UpdateItem',
          ],
          Resource: [
            'arn:aws:dynamodb:us-east-1:*:table/${self:provider.environment.USERS_TABLE}',
          ],
        }]
      },
    }],
  },
};

export default UnsubscribeChannelRole;