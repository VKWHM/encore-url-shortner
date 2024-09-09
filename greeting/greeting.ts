import { api } from "encore.dev/api";

interface Request {
  name?: string;
}

interface Response {
  data: string;
}

export const greeting = api<Request, Response>(
  {
    expose: true,
    path: "/greeting/:name",
    method: "GET",
  },
  async ({ name }: Request): Promise<Response> => {
    return { data: `Hello ${name || "World"}` };
  },
);
