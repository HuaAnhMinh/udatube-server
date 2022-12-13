import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {uploadVideo} from "../../businessLayer/video";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

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
    return errorResponse(e);
  }
};

export const main = middyfy(UploadVideo).use(cors());