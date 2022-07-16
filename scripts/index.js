import http from "node:http";
import { handler } from "../build/handler.js";

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

const server = http.createServer(handler);
server.listen({ host, port }, () => {
  console.log(`listening on ${host}:${port}`);
});
