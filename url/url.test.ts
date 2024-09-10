import { describe, it, expect, beforeAll } from "vitest";

const HOST: string = process.env.HOST || "http://localhost:4000";
const TIMEOUT = 10000;

describe("URL Shortner Endpoints", () => {
  const requested_url = { url: "https://example.com" };
  const url_request_options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requested_url),
  };

  type UrlResponseBody = { [key: string]: unknown };
  let url_response: Response;
  let url_response_body: UrlResponseBody;

  beforeAll(async () => {
    url_response = await fetch(`${HOST}/url`, url_request_options);
    url_response_body = (await url_response.json()) as UrlResponseBody;
  }, TIMEOUT);

  describe("Make Short URL Endpoint", () => {
    it("should return 200 status code", async () => {
      const status_code = url_response.status;

      expect(status_code).toBe(200);
    });

    it("should give shortid and requested url at response body", () => {
      const { shortid, url } = url_response_body;

      expect(shortid).not.toBeUndefined();
      expect(url).toBe(requested_url.url);
    });

    it("should retrieve valid url", () => {
      const url = new URL(`${HOST}${url_response_body.shortid || ""}`);

      expect(url.pathname).toHaveLength(1 + 8); // 1 (/) + 6 (random string)
    });

    it("should reject invalid urls via 400", async () => {
      const invalid_url = { url: "this is invalid url" };
      url_request_options.body = JSON.stringify(invalid_url);

      const response: Response = await fetch(
        `${HOST}/url`,
        url_request_options,
      ).catch((error) => error.response);

      expect(response.status).toBe(400);
    });
  });

  describe("Get Long URL Endpoint", () => {
    let shortid_response: Response;
    let shortid_response_body: UrlResponseBody;

    beforeAll(async () => {
      const url = `${HOST}${(url_response_body.shortid as string)?.startsWith("/") ? url_response_body.shortid : "/"}`;
      shortid_response = await fetch(url);
      shortid_response_body =
        (await shortid_response.json()) as UrlResponseBody;
    }, TIMEOUT);

    it("should return 200 status code", () => {
      const status_code = shortid_response.status;

      expect(status_code).toBe(200);
    });

    it("should give url at response body", () => {
      const url = shortid_response_body.url;

      expect(url).not.toBeUndefined();
    });

    it("should give shortned url at response", () => {
      const url = shortid_response_body.url;

      expect(url).toBe(requested_url.url);
    });

    it("should return 404 for non-exists ids", async () => {
      const url = `${HOST}/non-exists-url`;

      const response: Response = await fetch(url).catch(
        (error) => error.response,
      );

      expect(response?.status).toBe(404);
    });
  });
});
