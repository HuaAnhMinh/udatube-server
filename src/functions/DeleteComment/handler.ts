import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {deleteComment} from "../../businessLayer/comment";
import DeleteCommentErrors from "../../errors/DeleteCommentErrors";

const DeleteComment: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  try {
    const commentId = event.pathParameters.id;
    const userId = getUserId(event);
    await deleteComment(commentId, userId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Comment deleted successfully',
      }),
    };
  }
  catch (e) {
    console.log(e);

    switch (e.message) {
      case DeleteCommentErrors.FOUND_NO_USER:
      case DeleteCommentErrors.FOUND_NO_COMMENT:
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: e.message,
          }),
        };
      case DeleteCommentErrors.INVALID_PERMISSION:
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
            message: 'Internal server error',
          }),
        };
    }
  }
};

export const main = middyfy(DeleteComment);