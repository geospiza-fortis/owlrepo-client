import sirv from "sirv";
import polka from "polka";
import compression from "compression";
import { createProxyMiddleware } from "http-proxy-middleware";
import * as sapper from "@sapper/server";

const { PORT, NODE_ENV, OWLREPO_URL } = process.env;
const dev = NODE_ENV === "development";

const server = polka();

server.use(
  "/api/v1",
  createProxyMiddleware({
    target: OWLREPO_URL,
    changeOrigin: true,
  })
);

// simple redirect middleware
// https://github.com/lukeed/polka/issues/78#issuecomment-600496930
server.use(function (req, res, next) {
  res.redirect = (location) => {
    let str = `Redirecting to ${location}`;
    res.writeHead(302, {
      Location: location,
      "Content-Type": "text/plain",
      "Content-Length": str.length,
    });
    res.end(str);
  };
  next();
});

server
  .use(
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    sapper.middleware()
  )
  .listen(PORT, (err) => {
    if (err) console.log("error", err);
  });
