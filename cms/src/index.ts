import type { Core } from "@strapi/strapi";

async function createDefaultDevAdmin(strapi: Core.Strapi) {
  const { DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD } = process.env;

  if (!DEV_ADMIN_EMAIL || !DEV_ADMIN_PASSWORD) return;

  const userService = strapi.service("admin::user");
  if (await userService.exists()) return;

  // Same path as the signup form: super admin role, active, password hashed.
  await userService.createFirstAdmin({
    firstname: "Admin",
    lastname: "User",
    email: DEV_ADMIN_EMAIL.toLowerCase(),
    password: DEV_ADMIN_PASSWORD,
  });
  strapi.log.info(`Created default admin user ${DEV_ADMIN_EMAIL}`);
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const { ENV } = process.env;
    console.log("******************", ENV);
    if (ENV === "dev") {
      await createDefaultDevAdmin(strapi);
    }
  },
};
