import LogRole from "./LogRole";

const ViewProfileRole = {
  Type: 'AWS::IAM::Role',
  Properties: {
    RoleName: 'ViewProfileRole',
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
      PolicyName: 'ViewProfilePolicy',
      PolicyDocument: {
        Version: '2012-10-17',
        Statement: [...LogRole, {
          Effect: 'Allow',
          Action: [
            'dynamodb:Scan',
          ],
          Resource: [
            'arn:aws:dynamodb:us-east-1:*:table/${self:provider.environment.USERS_TABLE}',
          ],
        }],
      },
    }],
  },
};

export default ViewProfileRole;