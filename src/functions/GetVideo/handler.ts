import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {findVideoById} from "../../businessLayer/video";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

const GetVideo: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
  const videoId = event.pathParameters.id;
  const {queryStringParameters} = event;

  try {
    let video;
    if (queryStringParameters && queryStringParameters.hasOwnProperty('userId') && queryStringParameters.userId !== '') {
      video = await findVideoById(videoId, false, queryStringParameters.userId);
    }
    else {
      video = await findVideoById(videoId, true);
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
    return errorResponse(e);
  }
};

export const main = middyfy(GetVideo).use(cors());