import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getVideos} from "../../businessLayer/video";
import GetVideosErrors from "../../errors/GetVideosErrors";

const GetVideos: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  let {queryStringParameters} = event;
  if (queryStringParameters === null) {
    queryStringParameters = {};
  }

  try {
    const {videos, nextKey} = await getVideos(queryStringParameters);

    return {
      statusCode: 200,
      body: JSON.stringify({
        videos,
        nextKey,
      }),
    };
  }
  catch (e) {
    console.log(e);

    switch (e.message) {
      case GetVideosErrors.LIMIT_MUST_BE_NUMBER:
      case GetVideosErrors.LIMIT_MUST_BE_GREATER_THAN_0:
      case GetVideosErrors.NEXT_KEY_INVALID:
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

export const main = middyfy(GetVideos);