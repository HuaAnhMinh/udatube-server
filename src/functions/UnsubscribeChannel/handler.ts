import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {unsubscribeFromChannel} from "../../businessLayer/user";
import UnsubscribeChannelErrors from "../../errors/UnsubscribeChannelErrors";

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
    switch (e.message) {
      case UnsubscribeChannelErrors.CANNOT_UNSUBSCRIBE_SAME_ID:
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: e.message,
          }),
        };
      case UnsubscribeChannelErrors.USER_NOT_FOUND:
      case UnsubscribeChannelErrors.TARGET_NOT_FOUND:
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

export const main = middyfy(UnsubscribeChannel);