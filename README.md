# owlrepo-client

This is the client source for [OwlRepo](https://owlrepo.com).

## Get started

Install the dependencies...

```bash
cd owlrepo-client
npm install
```

Then start the dev server:

```bash
npm run dev
```

Navigate to [localhost:3000](http://localhost:3000). You should see your app
running. Edit a component file in `src`, save it, and reload the page to see
your changes.

To run the tests:

```bash
npm run test:e2e
```

## Building and running in production mode

To create an optimised version of the app in a non-production mode:

```bash
npm run build:dev
```

For production:

```bash
npm run build
```

You can run the newly built app with `npm run start`.

## Deploying to app engine

Deploy to app engine using the following commands.

```bash
# deploy to owlrepo-nonprod
uv run deploy.py staging

# deploy to owlrepo
uv run deploy.py production
```

## Building the desktop app

The desktop app is built using [Tauri](https://tauri.app/). Run the following
command to develop. This requires installing rust on your machine.

```bash
npm run tauri dev
```

Use `npm run tauri build` to create an installable that points to the production
instance. A github action is configured to publish automatically on release.
