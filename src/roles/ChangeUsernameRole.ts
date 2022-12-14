import LogRole from "./LogRole";

const ChangeUsernameRole = {
  Type: 'AWS::IAM::Role',
  Properties: {
    RoleName: 'ChangeUsernameRole',
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
      PolicyName: 'ChangeUsernameRolePolicy',
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
        }]
      },
    }],
  },
};

export default ChangeUsernameRole;