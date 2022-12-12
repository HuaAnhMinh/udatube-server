import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {findVideoById} from "../../businessLayer/video";
import cors from "@middy/http-cors";
import GetVideoErrors from "../../errors/GetVideoErrors";

const GetVideo: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const videoId = event.pathParameters.id;
  const {queryStringParameters} = event;

  try {
    let video;
    if (queryStringParameters && queryStringParameters.hasOwnProperty('userId') && queryStringParameters.userId !== '') {
      video = findVideoById(videoId, false, queryStringParameters.userId);
    }
    else {
      video = findVideoById(videoId, true);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        video,
      }),
    };
  }
  catch (e) {
    switch (e.message) {
      case GetVideoErrors.FOUND_NO_USER:
      case GetVideoErrors.FOUND_NO_VIDEO:
        return {
          statusCode: 404,
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

export const main = middyfy(GetVideo).use(cors());