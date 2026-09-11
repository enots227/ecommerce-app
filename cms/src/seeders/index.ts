import { Core } from "@strapi/strapi";

import { seedDefaultAdmin } from "./user.seeder";

export async function seedEnvironment(strapi: Core.Strapi): Promise<void> {
  await seedDefaultAdmin(strapi);
}
