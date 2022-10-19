import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getComments} from "../../businessLayer/comment";
import GetCommentsErrors from "../../errors/GetCommentsErrors";

const GetComments: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  let {queryStringParameters} = event;
  if (queryStringParameters === null) {
    queryStringParameters = {};
  }

  try {
    const {comments, nextKey} = await getComments(queryStringParameters);

    return {
      statusCode: 200,
      body: JSON.stringify({
        comments,
        nextKey,
      }),
    };
  }
  catch (e) {
    console.log(e);

    switch (e.message) {
      case GetCommentsErrors.FOUND_NO_VIDEO:
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: e.message,
          }),
        };
      case GetCommentsErrors.LIMIT_MUST_BE_NUMBER:
      case GetCommentsErrors.LIMIT_MUST_BE_GREATER_THAN_0:
      case GetCommentsErrors.NEXT_KEY_INVALID:
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
            message: 'Internal Server Error',
          }),
        };
    }
  }
};

export const main = middyfy(GetComments);