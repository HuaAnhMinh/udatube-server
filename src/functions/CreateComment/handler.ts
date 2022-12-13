import {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "@functions/CreateComment/schema";
import {middyfy} from "@libs/lambda";
import {createComment} from "../../businessLayer/comment";
import {getUserId} from "@functions/Authorizer/utils";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

const CreateComment: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const {videoId, content} = event.body;
    const userId = getUserId(event as any);
    const comment = await createComment(userId, videoId, content);
    return {
      statusCode: 201,
      body: JSON.stringify({
        comment,
      }),
    };
  }
  catch (e) {
    console.log(e);
    return errorResponse(e);
  }
};

export const main = middyfy(CreateComment).use(cors());