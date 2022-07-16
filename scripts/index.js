import http from "node:http";
import { handler } from "../build/handler.js";
import fetch from "node-fetch";

const host = process.env.HOST || "localhost";
let port = process.env.PORT || 3000;
if (process.argv.length > 2) {
  port = parseInt(process.argv[2]);
}

const server = http.createServer(handler);
server.listen({ host, port }, async () => {
  console.log(`listening on ${host}:${port}`);
  // make a request to the status endpoint
  let status_path = `http://${host}:${port}/api/v2/status`;
  console.log(`GET ${status_path}`);
  let resp = await fetch(status_path);
  let json = await resp.json();
  console.log(json);
});
