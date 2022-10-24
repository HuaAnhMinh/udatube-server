import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {reactVideo} from "../../businessLayer/video";
import ReactVideoErrors from "../../errors/ReactVideoErrors";
import cors from "@middy/http-cors";

const DislikeVideo: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  try {
    const videoId = event.pathParameters.id;
    const userId = getUserId(event);
    await reactVideo(videoId, userId, 'dislikes');
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Video disliked successfully'
      }),
    };
  }
  catch (e) {
    console.log(e);
    switch (e.message) {
      case ReactVideoErrors.FOUND_NO_VIDEO:
      case ReactVideoErrors.FOUND_NO_USER:
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: e.message
          }),
        };
      default:
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: 'Internal server error',
          }),
        };
    }
  }
};

export const main = middyfy(DislikeVideo).use(cors());