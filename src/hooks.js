// export async function handle({ request, resolve }) {
//   if (request.path.startsWith("/api/v1")) {
//     request.host = import.meta.env.VITE_OWLREPO_URL;
//     console.log(request);
//   }
//   return await resolve(request);
// }

export async function externalFetch(request) {
  if (request.url.includes("/api/v1")) {
    console.log(request);
  }
  return fetch(request);
}
