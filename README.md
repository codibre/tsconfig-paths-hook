[![Actions Status](https://github.com/Codibre/tsconfig-paths-hook/workflows/build/badge.svg)](https://github.com/Codibre/tsconfig-paths-hook/actions)
[![Actions Status](https://github.com/Codibre/tsconfig-paths-hook/workflows/test/badge.svg)](https://github.com/Codibre/tsconfig-paths-hook/actions)
[![Actions Status](https://github.com/Codibre/tsconfig-paths-hook/workflows/lint/badge.svg)](https://github.com/Codibre/tsconfig-paths-hook/actions)
[![Test Coverage](https://api.codeclimate.com/v1/badges/f4b9f261a5f27db93932/test_coverage)](https://codeclimate.com/github/Codibre/tsconfig-paths-hook/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/f4b9f261a5f27db93932/maintainability)](https://codeclimate.com/github/Codibre/tsconfig-paths-hook/maintainability)
[![Packages](https://david-dm.org/Codibre/tsconfig-paths-hook.svg)](https://david-dm.org/Codibre/tsconfig-paths-hook)

# tsconfig-paths-hook

Simple library to allow the use of tsconfig-paths as a ast transformer for the ones who supports it, like [**jest**](https://www.npmjs.com/package/**jest**) or [ttypescript](https://www.npmjs.com/package/ttypescript).

## How to Install

```
npm i -D tsconfig-paths-hook

```
## How to use

Just add the following string as a ast transformer for your tool of preference:

```
node_modules/tsconfig-paths-hook/transformer
```

For **jest**, it'd look like this:

```json
"transform": {
      "^.+\\.(t|j)s$": [
        "ts-**jest**",
        {
          "astTransformers": {
            "before": [
              "node_modules/tsconfig-paths-hook/transformer"
            ]
          }
        }
      ]
    },
```

It's common for **jest** users who also uses **tsconfig-paths** to duplicate the tsconfig.paths configuration into the jest one, but in the format of "moduleNameMapper". The problem with it is the lack of centralization and the possibility of different behavior between the built application and the unit tests. Using this hook, you guarantee that the code you're building is the one you're testing.

Notice that this project has been tested with **typescript 5**, it may work with former versions but if you have any issues, check it out if the problem don't have anything to do with ts version.

We also opened a [PR](https://github.com/dividab/tsconfig-paths/pull/273) for **tsconfig-paths** itself so it can embed this functionality. While it's not approved, this package can be used for such purpose.

## License

Licensed under [MIT](https://en.wikipedia.org/wiki/MIT_License).
