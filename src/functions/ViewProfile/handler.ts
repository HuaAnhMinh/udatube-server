import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import cors from '@middy/http-cors';
import {getProfile} from "../../businessLayer/user";
import {getUserId} from "@functions/Authorizer/utils";
import {errorResponse} from "../../errors/Errors";

const ViewProfile: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const id = event.pathParameters.id;
  console.log('Viewing profile with id: ', id);

  try {
    let user;
    if (id === 'me') {
      const userId = getUserId(event);
      user = await getProfile(userId);
    }
    else {
      user = await getProfile(id);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        user: user
      }),
    };
  }
  catch (e) {
    return errorResponse(e);
  }
};

export const main = middyfy(ViewProfile).use(cors());