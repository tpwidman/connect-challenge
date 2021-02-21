const pino = require("pino")({
  level: process.env.LOG_LEVEL || "debug",
  base: null,
});

module.exports = pino;
