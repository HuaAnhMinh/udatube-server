import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import cors from "@middy/http-cors";

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log('event: ', event);
  return formatJSONResponse({
    message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
    event,
  });
};

export const main = middyfy(hello).use(cors());
