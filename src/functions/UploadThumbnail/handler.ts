import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {uploadThumbnail} from "../../businessLayer/video";
import UploadThumbnailErrors from "../../errors/UploadThumbnailErrors";
import cors from "@middy/http-cors";

const UploadThumbnail: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  try {
    const userId = getUserId(event);
    const url = await uploadThumbnail(event.pathParameters.id, userId);
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
      case UploadThumbnailErrors.VIDEO_NOT_FOUND:
      case UploadThumbnailErrors.USER_NOT_FOUND:
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: e.message,
          }),
        };
      case UploadThumbnailErrors.INVALID_PERMISSION:
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

export const main = middyfy(UploadThumbnail).use(cors());