import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {subscribeToChannel} from "../../businessLayer/user";
import SubscribeChannelErrors from "../../errors/SubscribeChannelErrors";
import cors from "@middy/http-cors";

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
    switch (e.message) {
      case SubscribeChannelErrors.CANNOT_SUBSCRIBE_SAME_ID:
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: e.message,
          }),
        };
      case SubscribeChannelErrors.USER_NOT_FOUND:
      case SubscribeChannelErrors.TARGET_NOT_FOUND:
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: e.message,
          }),
        };
      default:
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: 'Internal Server Error',
          }),
        };
    }
  }
};

export const main = middyfy(SubscribeChannel).use(cors());