import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getComments} from "../../businessLayer/comment";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

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
    return errorResponse(e);
  }
};

export const main = middyfy(GetComments).use(cors());