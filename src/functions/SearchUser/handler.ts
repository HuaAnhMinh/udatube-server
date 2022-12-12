import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {searchUsers} from "../../businessLayer/user";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

const SearchUser: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  let {queryStringParameters} = event;
  if (queryStringParameters === null) {
    queryStringParameters = {};
  }

  try {
    const {users, nextKey} = await searchUsers(queryStringParameters);

    return {
      statusCode: 200,
      body: JSON.stringify({
        users,
        nextKey,
      }),
    };
  }
  catch (e) {
    console.log('Error: ', e);
    return errorResponse(e);
  }
};

export const main = middyfy(SearchUser).use(cors());