import { JwtHeader, decode, verify } from 'jsonwebtoken'
import JwksClient from "@functions/Authorizer/JwksClient";
import {APIGatewayProxyEvent} from "aws-lambda";

type JwtPayload = {
  iss?: string;
  sub?: string;
  iat?: number;
  exp?: number;
};

type Jwt = {
  header: JwtHeader;
  payload: JwtPayload;
};

export const verifyJwtToken = async (authHeader: string): Promise<JwtPayload> => {
  if (!authHeader) {
    throw new Error("No authentication header");
  }

  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    throw new Error("Invalid authentication header");
  }

  const token = authHeader.split(" ")[1];
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;

  if (jwt.header.alg !== 'RS256') {
    throw new Error('Invalid token');
  }

  const jwksClient = new JwksClient({
    strictSsl: true,
    jwksUri: process.env.JWKS_URI,
  });

  const key = await jwksClient.getSigningKey(jwt.header.kid);
  if (!key) {
    throw new Error('Invalid token');
  }

  const verifiedToken = verify(token, key.publicKey);
  if (typeof verifiedToken === 'string') {
    throw new Error('Invalid token');
  }
  return verifiedToken;
};

export const getUserId = (event: APIGatewayProxyEvent): string => {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1];

  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub;
}