import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {createUser} from "../../businessLayer/user";

const Register: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const userId = getUserId(event);
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
    console.log(e);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};

export const main = middyfy(Register);