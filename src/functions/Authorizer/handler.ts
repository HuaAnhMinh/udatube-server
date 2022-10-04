import {APIGatewayTokenAuthorizerEvent} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {verifyJwtToken} from "@functions/Authorizer/utils";

const Authorizer = async (event: APIGatewayTokenAuthorizerEvent) => {
  try {
    const jwtToken = await verifyJwtToken(event.authorizationToken);
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      },
    };
  }
  catch (e) {
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    };
  }
};

export const main = middyfy(Authorizer);