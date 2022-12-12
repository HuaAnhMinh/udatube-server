import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import cors from '@middy/http-cors';
import {getSubscribedChannels} from "../../businessLayer/user";
import {getUserId} from "@functions/Authorizer/utils";
import {errorResponse} from "../../errors/Errors";

const GetSubscribedChannels: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const id = event.pathParameters.id;
  console.log('Get subscribed channels of user with id: ', id);

  try {
    const users = await getSubscribedChannels(id === 'me' ? getUserId(event) : id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        users
      }),
    };
  }
  catch (e) {
    console.log(e);
    return errorResponse(e);
  }
};

export const main = middyfy(GetSubscribedChannels).use(cors());