import LogRole from "./LogRole";

export default {
  Type: 'AWS::IAM::Role',
  Properties: {
    RoleName: 'ResizeAvatarRole',
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
      PolicyName: 'ResizeAvatarRolePolicy',
      PolicyDocument: {
        Version: '2012-10-17',
        Statement: [...LogRole],
      },
    }],
  },
};