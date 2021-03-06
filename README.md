# owlrepo-client

This is the client source for [OwlRepo](https://owlrepo.com).

## Get started

Install the dependencies...

```bash
cd owlrepo-client
npm install
```

Copy over the `.env.template` to `.env` to define the testing server. Then start
[Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:3000](http://localhost:3000). You should see your app
running. Edit a component file in `src`, save it, and reload the page to see
your changes.

Use a browser addon like [CORS
Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/) in
Firefox or [Allow
CORS](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=en)
in Chrome during development. This is required because the client will be making
cross-origin requests. API calls may be relative to root (e.g. `/api`) in
production.

To run the tests:

```bash
npm run test
```

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`.

## Deploying to app engine

Two environments have been provisioned in GCP with various backend services like
bigquery and firestore. Deploy to app engine using the following commands.

```bash
gcloud app deploy app.nonprod.yaml --project owlrepo-nonprod
gcloud app deploy app.prod.yaml --project owlrepo
```
