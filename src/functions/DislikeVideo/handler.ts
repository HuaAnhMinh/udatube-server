import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {reactVideo} from "../../businessLayer/video";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

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
    return errorResponse(e);
  }
};

export const main = middyfy(DislikeVideo).use(cors());