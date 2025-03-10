import { APIError, ErrCode, api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { randomBytes } from "node:crypto";

const db = new SQLDatabase("urls_shortner", { migrations: "./migrations" });

interface ShortnerRequest {
  url: string;
}

interface ShortnerResponse {
  shortid: string;
  url: string;
}

export const shortner = api<ShortnerRequest, ShortnerResponse>(
  {
    method: "POST",
    expose: true,
    path: "/url",
  },
  async ({ url }) => {
    try {
      new URL(url);
    } catch (err) {
      throw new APIError(ErrCode.InvalidArgument, (err as TypeError).message);
    }
    const shortid = randomBytes(6).toString("base64url");
    await db.exec`INSERT INTO urls (id, url) VALUES (${shortid}, ${url});`;
    return { url, shortid: `/${shortid}` };
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
    const row = await db.queryRow`SELECT url FROM urls WHERE id = ${shortid}`;
    if (!row) throw APIError.notFound("id not exists");
    return { url: row?.url };
  },
);
