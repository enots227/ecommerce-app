import type { Core } from "@strapi/strapi";

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Database => ({
  connection: {
    client: "postgres",
    connection: {
      connectionString: env("ECOMMERCE_CMS_DB_URL"),
      host: env("ECOMMERCE_CMS_DB_HOST", "localhost"),
      port: env.int("ECOMMERCE_CMS_DB_PORT", 5432),
      database: env("ECOMMERCE_CMS_DB_NAME", "ecommerce-cms"),
      user: env("ECOMMERCE_CMS_DB_USER", "xxx"),
      password: env("ECOMMERCE_CMS_DB_PASSWORD", "xxx"),
      ssl: env.bool("ECOMMERCE_CMS_DB_SSL", false) && {
        key: env("ECOMMERCE_CMS_DB_SSL_KEY", undefined),
        cert: env("ECOMMERCE_CMS_DB_SSL_CERT", undefined),
        ca: env("ECOMMERCE_CMS_DB_SSL_CA", undefined),
        capath: env("ECOMMERCE_CMS_DB_SSL_CAPATH", undefined),
        cipher: env("ECOMMERCE_CMS_DB_SSL_CIPHER", undefined),
        rejectUnauthorized: env.bool(
          "ECOMMERCE_CMS_DB_SSL_REJECT_UNAUTHORIZED",
          true,
        ),
      },
      schema: env("ECOMMERCE_CMS_DB_SCHEMA", "public"),
    },
    pool: {
      min: env.int("ECOMMERCE_CMS_DB_POOL_MIN", 2),
      max: env.int("ECOMMERCE_CMS_DB_POOL_MAX", 10),
    },
    acquireConnectionTimeout: env.int(
      "ECOMMERCE_CMS_DB_CONNECTION_TIMEOUT",
      60000,
    ),
  },
});

export default config;
