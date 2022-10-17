import LogRole from "./LogRole";

const ChangeAvatarRole = {
  Type: 'AWS::IAM::Role',
  Properties: {
    RoleName: 'ChangeAvatarRole',
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
      PolicyName: 'ChangeAvatarRolePolicy',
      PolicyDocument: {
        Version: '2012-10-17',
        Statement: [...LogRole, {
          Effect: 'Allow',
          Action: [
            's3:PutObject',
          ],
          Resource: [
            'arn:aws:s3:::${self:provider.environment.AVATARS_BUCKET}/*',
          ],
        }]
      },
    }],
  },
};

export default ChangeAvatarRole;