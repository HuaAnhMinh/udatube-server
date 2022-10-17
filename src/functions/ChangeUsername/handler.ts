import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "@functions/ChangeUsername/schema";
import {APIGatewayProxyEvent} from "aws-lambda";
import {editUsername} from "../../businessLayer/user";
import ChangeUsernameErrors from "../../errors/ChangeUsernameErrors";

const ChangeUsername: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const userId = getUserId(event as unknown as APIGatewayProxyEvent);
  const newUsername = event.body.username;

  try {
    await editUsername(userId, newUsername);
    return formatJSONResponse({
      message: 'Username changed successfully',
    });
  }
  catch (e) {
    console.log(e);

    if (e.message === ChangeUsernameErrors.USER_NOT_FOUND) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'User not found',
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    };
  }
};

export const main = middyfy(ChangeUsername);