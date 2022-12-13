import {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from "aws-lambda";
import {middyfy} from "@libs/lambda";
import {getVideos} from "../../businessLayer/video";
import cors from "@middy/http-cors";
import {errorResponse} from "../../errors/Errors";

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
    return errorResponse(e);
  }
};

export const main = middyfy(GetVideos).use(cors());