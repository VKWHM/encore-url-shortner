import { api } from "encore.dev/api";
import { randomBytes } from "node:crypto";

interface ShortnerRequest {
  url: string;
}

interface ShortnerResponse {
  shortid: string;
}

export const shortner = api<ShortnerRequest, ShortnerResponse>(
  {
    method: "POST",
    expose: true,
    path: "/url",
  },
  async ({ url }) => {
    const shortid = randomBytes(4).toString("base64url");
    return { shortid: `/${shortid}` };
  },
);

interface LongnerRequest {
  shortid: string;
}

interface LongnerResponse {
  url: string;
}

export const longner = api<LongnerRequest, LongnerResponse>(
  { path: "/:shortid", method: "GET", expose: true },
  async ({ shortid }) => {
    return { url: shortid };
  },
);
