import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {deleteComment} from "../../businessLayer/comment";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

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
    return errorResponse(e);
  }
};

export const main = middyfy(DeleteComment).use(cors());