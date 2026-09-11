import { Core } from "@strapi/strapi";

const TOKEN_NAME = "ecommerce";

export async function seedApiToken(strapi: Core.Strapi): Promise<void> {
  const { ECOMMERCE_CMS_API_TOKEN } = process.env;

  if (!ECOMMERCE_CMS_API_TOKEN) return;

  const tokens = strapi.db.query("admin::api-token");
  const tokenService = strapi.service("admin::api-token-content-api");
  // Requests are matched on the salted hash; the encrypted copy lets the
  // admin panel reveal the key.
  const keys = {
    accessKey: tokenService.hash(ECOMMERCE_CMS_API_TOKEN),
    encryptedKey: strapi
      .service("admin::encryption")
      .encrypt(ECOMMERCE_CMS_API_TOKEN),
  };

  const existing = await tokens.findOne({ where: { name: TOKEN_NAME } });
  if (existing?.accessKey === keys.accessKey) return;

  // create() always generates a random key, so overwrite it with the env value.
  const { id } =
    existing ??
    (await tokenService.create({
      name: TOKEN_NAME,
      description: "Seeded from ECOMMERCE_CMS_API_TOKEN",
      type: "read-only",
      lifespan: null,
    }));
  await tokens.update({ where: { id }, data: keys });
  strapi.log.info(`Seeded API token "${TOKEN_NAME}" from ECOMMERCE_CMS_API_TOKEN`);
}
