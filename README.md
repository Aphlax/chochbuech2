# Chochbuech2

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version
18.2.4.

## Development server

Run

```
ng build --configuration development; cp config.json dist/chochbuech2/server/config.json; cp keys.json dist/chochbuech2/server/keys.json
```

then run

```
dist\chochbuech2\server\server.mjs
```

or set up WebStorm with two configurations, first a run script with the build command, then a node
with a before launch configuration. Use `mklink /J "C:\bin" "C:\Program Files\Git\bin"` in the
project directory to fix the bug.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also
use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build --configuration development; cp config.json dist/chochbuech2/server/config.json; cp keys.json dist/chochbuech2/server/keys.json`
to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
