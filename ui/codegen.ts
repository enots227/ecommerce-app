import type { CodegenConfig } from "@graphql-codegen/cli";
import { CMS_GRAPHQL_URL } from "./lib/cms";

const config: CodegenConfig = {
  schema: CMS_GRAPHQL_URL,
  documents: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
  ignoreNoDocuments: true,
  generates: {
    "./gql/": {
      preset: "client",
      config: {
        useTypeImports: true,
        // Strapi serializes both as ISO-8601 strings; without this they generate as `unknown`.
        scalars: { Date: "string", DateTime: "string" },
      },
    },
  },
};

export default config;
