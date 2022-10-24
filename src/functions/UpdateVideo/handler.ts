import {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "@functions/UpdateVideo/schema";
import {middyfy} from "@libs/lambda";
import {updateVideo} from "../../businessLayer/video";
import {getUserId} from "@functions/Authorizer/utils";
import UpdateVideoErrors from "../../errors/UpdateVideoErrors";
import cors from "@middy/http-cors";

const UpdateVideo: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const videoId = event.pathParameters.id;
    const userId = getUserId(event);
    const {title, description} = event.body;
    await updateVideo(videoId, userId, title, description);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Video updated successfully',
      }),
    };
  }
  catch (e) {
    console.log(e);
    switch (e.message) {
      case UpdateVideoErrors.INVALID_TITLE:
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: e.message,
          }),
        };
      case UpdateVideoErrors.FOUND_NO_VIDEO:
      case UpdateVideoErrors.FOUND_NO_USER:
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: e.message,
          }),
        };
      case UpdateVideoErrors.INVALID_PERMISSION:
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

export const main = middyfy(UpdateVideo).use(cors());