import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {changeAvatar} from "../../businessLayer/user";

const ChangeAvatar: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  try {
    const userId = getUserId(event);
    const url = await changeAvatar(userId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        url,
      }),
    };
  }
  catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
      }),
    };
  }
};

export const main = middyfy(ChangeAvatar);