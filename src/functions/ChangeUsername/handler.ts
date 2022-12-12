import {middyfy} from "@libs/lambda";
import {getUserId} from "@functions/Authorizer/utils";
import {formatJSONResponse, ValidatedEventAPIGatewayProxyEvent} from "@libs/api-gateway";
import schema from "@functions/ChangeUsername/schema";
import {APIGatewayProxyEvent} from "aws-lambda";
import {editUsername} from "../../businessLayer/user";
import cors from "@middy/http-cors";
import * as console from "console";
import {errorResponse} from "../../errors/Errors";

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
    return errorResponse(e);
  }
};

export const main = middyfy(ChangeUsername).use(cors());