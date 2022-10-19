import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {searchUsers} from "../../businessLayer/user";
import SearchUsersErrors from "../../errors/SearchUsersErrors";

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

    switch (e.message) {
      case SearchUsersErrors.NEXT_KEY_INVALID:
      case SearchUsersErrors.LIMIT_MUST_BE_GREATER_THAN_0:
      case SearchUsersErrors.LIMIT_MUST_BE_NUMBER:
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

export const main = middyfy(SearchUser);