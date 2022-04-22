import Fastify from "fastify";
import fastifyEnv from "fastify-env";
import S from "fluent-json-schema";

import database from "./plugins/database.js";
import email from "./plugins/email.js";
import authentication from "./v1/authentication.js";
import v1 from "./v1/routes.js";

const fastify = Fastify({
  logger: true,
});

const options = {
  schema: S.object()
    .prop("JWT_SECRET", S.string())
    .prop("DB_HOST", S.string())
    .prop("DB_USER", S.string())
    .prop("DB_PASSWORD", S.string())
    .prop("DB_NAME", S.string())
    .prop("SIB_API_KEY", S.string()),
  dotenv: true,
};

fastify.register(fastifyEnv, options);
fastify.register(database);
fastify.register(email);
fastify.register(authentication);
fastify.register(v1, { prefix: "/v1" });

fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
