import axios from "axios";
import {Agent} from "https";

type JwksClientOptions = {
  strictSsl: boolean;
  jwksUri: string;
};

type JwkKey = {
  alg: string;
  kty: string;
  use: string;
  x5c: string[];
  n: string;
  e: string;
  kid: string;
  x5t: string;
};

type SigningKey = {
  kid: string;
  publicKey: string;
};

class JwksClient {
  private options: JwksClientOptions;

  constructor(options: JwksClientOptions) {
    this.options = {...options};
  }

  private async getJwks(): Promise<JwkKey[]> {
    const instance = axios.create({
      httpsAgent: new Agent({
        rejectUnauthorized: this.options.strictSsl,
      })
    });

    const response = await instance.get(this.options.jwksUri, {
      headers: {
        'Content-Type': 'application/json'
      },
    });

    return response.data.keys;
  }

  private certToPEM(cert: string) {
    // @ts-ignore
    cert = cert.match(/.{1,64}/g).join('\n');
    cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
    return cert;
  }

  async getSigningKey(kid: string): Promise<SigningKey> {
    const keys = await this.getJwks();

    const signingKeys = keys.filter(key => key.use === 'sig'
      && key.kty === 'RSA'
      && key.kid
      && (key.x5c && key.x5c.length) || (key.n && key.e)).map(key => ({
      kid: key.kid,
      publicKey: this.certToPEM(key.x5c[0])
    }));

    const signingKey = signingKeys.find(key => key.kid === kid);
    if (!signingKey) {
      throw new Error();
    }

    return signingKey;
  }
}

export default JwksClient;