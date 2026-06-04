module.exports = jest.fn((config) => ({
  id: "mock-provider",
  name: "Mock Provider",
  type: "oauth",
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  options: config,
}));
