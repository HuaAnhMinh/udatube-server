import {APIGatewayProxyResult} from "aws-lambda";

export type ErrorFormat = {
  statusCode: number;
  message: string;
};

export const errorResponse = (e: any): APIGatewayProxyResult => {
  const error = e as ErrorFormat;
  return {
    statusCode: error.statusCode,
    body: JSON.stringify({
      message: error.message,
    }),
  };
};

export default {
  UnknownError: (message: string): ErrorFormat => ({
    statusCode: 500,
    message,
  }),
  UserNotFound: {
    statusCode: 404,
    message: `User not found`,
  } as ErrorFormat,
  UserAlreadyExists: {
    statusCode: 400,
    message: `User already exists`,
  } as ErrorFormat,
  LimitMustBeNumber: {
    statusCode: 400,
    message: `The limit parameter must be number`,
  } as ErrorFormat,
  LimitMustBeGreaterThan0: {
    statusCode: 400,
    message: `Limit must be greater than 0`,
  } as ErrorFormat,
  InvalidNextKey: {
    statusCode: 400,
    message: `Invalid next key`,
  } as ErrorFormat,
  CannotSubscribeSameId: {
    statusCode: 400,
    message: `User cannot subscribe to himself / herself`,
  } as ErrorFormat,
  CannotUnsubscribeSameId: {
    statusCode: 400,
    message: `User cannot unsubscribe from himself / herself`,
  } as ErrorFormat,
  InvalidUsername: {
    statusCode: 400,
    message: `Username cannot be empty`,
  } as ErrorFormat,
  InvalidImage: {
    statusCode: 400,
    message: `Invalid image`,
  } as ErrorFormat,
  InvalidTitle: {
    statusCode: 400,
    message: `Video title cannot be empty`,
  } as ErrorFormat,
  VideoNotFound: {
    statusCode: 404,
    message: `Video not found`,
  } as ErrorFormat,
  InvalidPermissionToEditVideo: {
    statusCode: 403,
    message: `You don't have the permission to modify this video`,
  } as ErrorFormat,
}