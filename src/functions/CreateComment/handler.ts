import {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "@functions/CreateComment/schema";
import {middyfy} from "@libs/lambda";
import {createComment} from "../../businessLayer/comment";
import {getUserId} from "@functions/Authorizer/utils";
import CreateCommentErrors from "../../errors/CreateCommentErrors";

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

    switch (e.message) {
      case CreateCommentErrors.CONTENT_IS_EMPTY:
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: e.message,
          }),
        };
      case CreateCommentErrors.FOUND_NO_USER:
      case CreateCommentErrors.FOUND_NO_VIDEO:
        return {
          statusCode: 404,
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

export const main = middyfy(CreateComment);