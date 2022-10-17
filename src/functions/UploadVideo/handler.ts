import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {uploadVideo} from "../../businessLayer/video";
import UploadVideoErrors from "../../errors/UploadVideoErrors";

const UploadVideo: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  try {
    const userId = getUserId(event);
    const url = await uploadVideo(event.pathParameters.id, userId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        url,
      }),
    };
  }
  catch (e) {
    console.log(e);
    
    switch (e.message) {
      case UploadVideoErrors.VIDEO_NOT_FOUND:
      case UploadVideoErrors.USER_NOT_FOUND:
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: e.message,
          }),
        };
      case UploadVideoErrors.INVALID_PERMISSION:
        return {
          statusCode: 400,
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

export const main = middyfy(UploadVideo);