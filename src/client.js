import * as sapper from "@sapper/app";

sapper.start({
  target: document.querySelector("#sapper"),
});

console.log(navigator.serviceWorker);
navigator.serviceWorker.addEventListener("message", (event) => {
  console.log(event.data);
});
