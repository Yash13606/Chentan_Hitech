import { handlers, auth } from "@/server/auth";

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  if (url.pathname === "/api/auth/session") {
    return Response.json(await auth());
  }
  return handlers.GET(req);
};

export const POST = handlers.POST;
