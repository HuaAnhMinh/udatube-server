import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {searchUsers} from "../../businessLayer/user";

const SearchUser: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const username = event.queryStringParameters.username;
  console.log('Searching for users with username: ', username);
  try {
    const users = await searchUsers(username);

    return {
      statusCode: 200,
      body: JSON.stringify({
        users: users,
      }),
    };
  }
  catch (e) {
    console.log('Error: ', e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
      }),
    };
  }
};

export const main = middyfy(SearchUser);