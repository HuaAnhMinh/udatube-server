import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {subscribeToChannel} from "../../businessLayer/user";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

const SubscribeChannel: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const userId = getUserId(event);
  const channelId = event.pathParameters.id;
  console.log('Subscribing user with id: ', userId, ' to channel with id: ', channelId);

  try {
    await subscribeToChannel(userId, channelId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `User ${userId} subscribed to channel ${channelId} successfully`,
      }),
    };
  }
  catch (e) {
    console.log(e);
    return errorResponse(e);
  }
};

export const main = middyfy(SubscribeChannel).use(cors());