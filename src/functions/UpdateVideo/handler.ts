import {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "@functions/UpdateVideo/schema";
import {middyfy} from "@libs/lambda";
import {updateVideo} from "../../businessLayer/video";
import {getUserId} from "@functions/Authorizer/utils";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

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
    return errorResponse(e);
  }
};

export const main = middyfy(UpdateVideo).use(cors());