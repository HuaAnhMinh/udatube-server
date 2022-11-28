import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {findVideoById, findVideoByIdToUpdate} from "../../businessLayer/video";
import cors from "@middy/http-cors";
import UpdateVideoErrors from "../../errors/UpdateVideoErrors";

const GetVideo: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const videoId = event.pathParameters.id;
  const {queryStringParameters} = event;
  if (queryStringParameters && queryStringParameters.hasOwnProperty('userId') && queryStringParameters.userId !== '') {
    try {
      const video = await findVideoByIdToUpdate(videoId, queryStringParameters.userId);
      return {
        statusCode: 200,
        body: JSON.stringify({
          video,
        }),
      };
    }
    catch (e) {
      switch (e.message) {
        case UpdateVideoErrors.FOUND_NO_USER:
        case UpdateVideoErrors.FOUND_NO_VIDEO:
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
  }

  try {
    const video = await findVideoById(videoId, true);
    if (!video) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Video not found',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        video,
      }),
    };
  }
  catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    };
  }
};

export const main = middyfy(GetVideo).use(cors());