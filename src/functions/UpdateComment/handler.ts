import {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "@functions/UpdateComment/schema";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {updateComment} from "../../businessLayer/comment";
import UpdateCommentErrors from "../../errors/UpdateCommentErrors";

const UpdateComment: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const commentId = event.pathParameters.id;
    const {content} = event.body;
    const userId = getUserId(event as any);

    await updateComment(commentId, userId, content);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Comment updated successfully',
      }),
    };
  }
  catch (e) {
    console.log(e);
    switch (e.message) {
      case UpdateCommentErrors.CONTENT_IS_EMPTY:
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: e.message,
          }),
        };
      case UpdateCommentErrors.FOUND_NO_COMMENT:
      case UpdateCommentErrors.FOUND_NO_USER:
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: e.message,
          }),
        };
      case UpdateCommentErrors.INVALID_PERMISSION:
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
            message: 'Internal Server Error',
          }),
        };
    }
  }
};

export const main = middyfy(UpdateComment);