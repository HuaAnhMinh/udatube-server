import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {createUser} from "../../businessLayer/user";
import RegisterErrors from "../../errors/RegisterErrors";
import cors from "@middy/http-cors";

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
    
    switch (e.message) {
      case RegisterErrors.USER_ALREADY_EXISTS:
        return {
          statusCode: 409,
          body: JSON.stringify({
            message: e.message,
          }),
        };
      default:
        return {
          statusCode: 500,
          body: 'Internal server error',
        };
    }
  }
};

export const main = middyfy(Register).use(cors());