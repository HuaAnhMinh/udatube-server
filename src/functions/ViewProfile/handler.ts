import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import cors from '@middy/http-cors';
import {getProfile} from "../../businessLayer/user";
import ViewProfileErrors from "../../errors/ViewProfileErrors";
import {getUserId} from "@functions/Authorizer/utils";

const ViewProfile: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const id = event.pathParameters.id;
  console.log('Viewing profile with id: ', id);

  let user;
  if (id === 'me') {
    const userId = getUserId(event);
    user = await getProfile(userId);
  }
  else {
    user = await getProfile(id);
  }

  if (user) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        user: user
      }),
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: ViewProfileErrors.USER_NOT_FOUND,
    }),
  };
};

export const main = middyfy(ViewProfile).use(cors());