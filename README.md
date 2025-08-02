# Chochbuech2

Your handy choch-buech.

## Development server

Run

```
ng build --configuration development;
cp config.json dist/chochbuech2/server/config.json;
cp keys.json dist/chochbuech2/server/keys.json;
echo "" >> dist/chochbuech2/server/server.mjs
```

then run

```
dist\chochbuech2\server\server.mjs
```

or set up WebStorm with two configurations, first a run script with the build command, then a node
with a before launch configuration. Use `mklink /J "C:\bin" "C:\Program Files\Git\bin"` in the
project directory to fix the bug.

Set the `maxAge` to `0y` in `server.ts` to have the most recent code in the browser.

## Build

Run `ng build --configuration development; cp config.json dist/chochbuech2/server/config.json; cp keys.json dist/chochbuech2/server/keys.json`
to build the project. The build artifacts will be stored in the `dist/` directory.

## Deploy

Run `npm run deploy` or `./deploy.ps1`.
