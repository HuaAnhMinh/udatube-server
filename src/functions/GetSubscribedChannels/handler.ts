import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import cors from '@middy/http-cors';
import {getSubscribedChannels} from "../../businessLayer/user";
import ViewProfileErrors from "../../errors/ViewProfileErrors";
import {getUserId} from "@functions/Authorizer/utils";

const GetSubscribedChannels: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const id = event.pathParameters.id;
  console.log('Get subscribed channels of user with id: ', id);

  let users;
  if (id === 'me') {
    const userId = getUserId(event);
    users = await getSubscribedChannels(userId);
  }
  else {
    users = await getSubscribedChannels(id);
  }

  if (users === null) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: ViewProfileErrors.USER_NOT_FOUND,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      users
    }),
  };
};

export const main = middyfy(GetSubscribedChannels).use(cors());