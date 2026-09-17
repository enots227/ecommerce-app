import { Core } from "@strapi/strapi";

export async function seedDefaultAdmin(strapi: Core.Strapi): Promise<void> {
  const { DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD } = process.env;

  if (!DEV_ADMIN_EMAIL || !DEV_ADMIN_PASSWORD) return;

  const userService = strapi.service("admin::user");
  if (await userService.exists()) {
    strapi.log.info("Admin user already default");
    return;
  }

  // Same path as the signup form: super admin role, active, password hashed.
  await userService.createFirstAdmin({
    firstname: "Admin",
    lastname: "User",
    email: DEV_ADMIN_EMAIL.toLowerCase(),
    password: DEV_ADMIN_PASSWORD,
  });
  strapi.log.info(`Created default admin user ${DEV_ADMIN_EMAIL}`);
}
