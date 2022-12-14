import LogRole from "./LogRole";

const RegisterRole = {
  Type: 'AWS::IAM::Role',
  Properties: {
    RoleName: 'RegisterRole',
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
      PolicyName: 'RegisterPolicy',
      PolicyDocument: {
        Version: '2012-10-17',
        Statement: [...LogRole, {
          Effect: 'Allow',
          Action: [
            'dynamodb:PutItem',
            'dynamodb:GetItem',
          ],
          Resource: [
            'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.USERS_TABLE}',
          ],
        }, {
          Effect: 'Allow',
          Action: [
            's3:PutObject',
          ],
          Resource: [
            'arn:aws:s3:::${self:provider.environment.AVATARS_BUCKET}/*',
          ],
        }],
      },
    }],
  },
};

export default RegisterRole;