import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {findVideoById} from "../../businessLayer/video";
import cors from "@middy/http-cors";

const GetVideo: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const videoId = event.pathParameters.id;
  try {
    const video = await findVideoById(videoId);
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