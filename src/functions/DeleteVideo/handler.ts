import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {deleteVideo} from "../../businessLayer/video";
import DeleteVideoErrors from "../../errors/DeleteVideoErrors";
import cors from "@middy/http-cors";

const DeleteVideo: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  try {
    const videoId = event.pathParameters.id;
    const userId = getUserId(event);
    await deleteVideo(videoId, userId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Video deleted successfully',
      }),
    };
  }
  catch (e) {
    console.log(e);

    switch (e.message) {
      case DeleteVideoErrors.FOUND_NO_USER:
      case DeleteVideoErrors.FOUND_NO_VIDEO:
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: e.message,
          }),
        };
      case DeleteVideoErrors.INVALID_PERMISSION:
        return {
          statusCode: 403,
          body: JSON.stringify({
            message: e.message,
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

export const main = middyfy(DeleteVideo).use(cors());