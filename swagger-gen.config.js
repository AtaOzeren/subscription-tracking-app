module.exports = {
  name: "tracking-api.ts",
  output: "./src/services/tracking",
  input: "./src/services/tracking/swagger.json",
  httpClientType: "fetch",
  generateClient: true,
  generateRouteTypes: true,
  generateResponses: true,
  extractRequestParams: true,
  extractRequestBody: true,
  prettier: {
    printWidth: 120,
    tabWidth: 2,
    trailingComma: "es5",
    semi: true,
  }
};