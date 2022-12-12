import {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "@functions/CreateVideo/schema";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {createVideo} from "../../businessLayer/video";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

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

    return errorResponse(e);
  }
};

export const main = middyfy(CreateVideo).use(cors());