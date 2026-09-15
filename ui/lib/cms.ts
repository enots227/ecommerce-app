import { GraphQLClient } from "graphql-request";

export const CMS_GRAPHQL_URL = `${process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:1338"}/graphql`;

const token = process.env.NEXT_PUBLIC_ECOMMERCE_CMS_API_TOKEN;

const authorizationHeaderValue = `Bearer ${token}`;

export const cms = new GraphQLClient(CMS_GRAPHQL_URL, {
  headers: token ? { Authorization: authorizationHeaderValue } : {},
});
