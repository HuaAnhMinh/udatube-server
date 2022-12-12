import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {createUser} from "../../businessLayer/user";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

const Register: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const userId = getUserId(event);
  console.log('Registering user with id: ', userId);
  try {
    const user = await createUser(userId);
    return {
      statusCode: 201,
      body: JSON.stringify({
        user,
      }),
    };
  }
  catch (e) {
    console.log(e.message);
    return errorResponse(e);
  }
};

export const main = middyfy(Register).use(cors());