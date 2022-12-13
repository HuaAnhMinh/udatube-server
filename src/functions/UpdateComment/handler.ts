import {ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "@functions/UpdateComment/schema";
import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {updateComment} from "../../businessLayer/comment";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

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
    return errorResponse(e);
  }
};

export const main = middyfy(UpdateComment).use(cors());