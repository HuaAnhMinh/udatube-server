import {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "@functions/CreateComment/schema";
import {middyfy} from "@libs/lambda";
import {createComment} from "../../businessLayer/comment";
import {getUserId} from "@functions/Authorizer/utils";
import CreateCommentErrors from "../../errors/CreateCommentErrors";

const CreateComment: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const {videoId, comment} = event.body;
    const userId = getUserId(event as any);
    const newComment = await createComment(userId, videoId, comment);
    return {
      statusCode: 201,
      body: JSON.stringify({
        comment: newComment,
      }),
    };
  }
  catch (e) {
    console.log(e);

    switch (e.message) {
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