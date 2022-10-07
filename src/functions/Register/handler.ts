import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {createUser} from "../../businessLayer/user";

const Register: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const userId = getUserId(event);
  console.log('Registering user with id: ', userId);
  try {
    await createUser(userId);
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: `User ${userId} created successfully`,
      }),
    };
  }
  catch (e) {
    console.log(e.message);
    if (e.message === 'User already exists') {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: e.message,
        }),
      };
    }
    return {
      statusCode: 500,
      body: 'Internal server error',
    };
  }
};

export const main = middyfy(Register);