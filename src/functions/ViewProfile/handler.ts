import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getProfile} from "../../businessLayer/user";

const ViewProfile: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const id = event.pathParameters.id;
  console.log('Viewing profile with id: ', id);

  const user = await getProfile(id);

  if (user) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        user: user
      }),
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: 'User not found',
    }),
  };
};

export const main = middyfy(ViewProfile);