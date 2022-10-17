import {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "@functions/CreateVideo/schema";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {createVideo} from "../../businessLayer/video";
import CreateVideoErrors from "../../errors/CreateVideoErrors";

const CreateVideo: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const userId = getUserId(event as any);
    const {title, description} = event.body;
    const video = await createVideo(userId, title, description);
    return {
      statusCode: 201,
      body: JSON.stringify({
        video,
      }),
    };
  }
  catch (e) {
    console.log(e);

    switch (e.message) {
      case CreateVideoErrors.INVALID_TITLE:
      case CreateVideoErrors.USER_NOT_EXIST:
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
            message: 'Internal server error',
          }),
        };
    }
  }
};

export const main = middyfy(CreateVideo);