import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {unsubscribeFromChannel} from "../../businessLayer/user";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

const UnsubscribeChannel: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const userId = getUserId(event);
  const channelId = event.pathParameters.id;
  console.log('Unsubscribing user with id: ', userId, ' from channel with id: ', channelId);

  try {
    await unsubscribeFromChannel(userId, channelId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `User ${userId} unsubscribed from channel ${channelId} successfully`,
      }),
    };
  }
  catch (e) {
    console.log(e);
    return errorResponse(e);
  }
};

export const main = middyfy(UnsubscribeChannel).use(cors());