/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query Book($catalogSlug: String!, $productSlug: String!) {\n    catalogs(\n      filters: { slug: { eqi: $catalogSlug } }\n      pagination: { limit: 1 }\n    ) {\n      documentId\n      title\n      slug\n    }\n    books(filters: { slug: { eqi: $productSlug } }, pagination: { limit: 1 }) {\n      documentId\n      slug\n      title\n      authors {\n        documentId\n        firstName\n        lastName\n      }\n      stockKeepingUnits {\n        documentId\n        condition\n        format\n        edition {\n          documentId\n          name\n          releasedAt\n        }\n        sku {\n          prices {\n            price\n            startAt\n            endAt\n            discounts {\n              action\n              amount\n              startAt\n              endAt\n            }\n          }\n        }\n      }\n    }\n  }\n": typeof types.BookDocument,
    "\n  query Books {\n    books {\n      documentId\n      slug\n      title\n      authors {\n        documentId\n        firstName\n        lastName\n      }\n      stockKeepingUnits {\n        documentId\n        condition\n        format\n        sku {\n          prices {\n            price\n            startAt\n            endAt\n            discounts {\n              action\n              amount\n              startAt\n              endAt\n            }\n          }\n        }\n      }\n    }\n  }\n": typeof types.BooksDocument,
    "\n  query Catalog($slug: String!) {\n    catalogs(filters: { slug: { eqi: $slug } }, pagination: { limit: 1 }) {\n      documentId\n      title\n      slug\n      summary\n      filters\n    }\n  }\n": typeof types.CatalogDocument,
};
const documents: Documents = {
    "\n  query Book($catalogSlug: String!, $productSlug: String!) {\n    catalogs(\n      filters: { slug: { eqi: $catalogSlug } }\n      pagination: { limit: 1 }\n    ) {\n      documentId\n      title\n      slug\n    }\n    books(filters: { slug: { eqi: $productSlug } }, pagination: { limit: 1 }) {\n      documentId\n      slug\n      title\n      authors {\n        documentId\n        firstName\n        lastName\n      }\n      stockKeepingUnits {\n        documentId\n        condition\n        format\n        edition {\n          documentId\n          name\n          releasedAt\n        }\n        sku {\n          prices {\n            price\n            startAt\n            endAt\n            discounts {\n              action\n              amount\n              startAt\n              endAt\n            }\n          }\n        }\n      }\n    }\n  }\n": types.BookDocument,
    "\n  query Books {\n    books {\n      documentId\n      slug\n      title\n      authors {\n        documentId\n        firstName\n        lastName\n      }\n      stockKeepingUnits {\n        documentId\n        condition\n        format\n        sku {\n          prices {\n            price\n            startAt\n            endAt\n            discounts {\n              action\n              amount\n              startAt\n              endAt\n            }\n          }\n        }\n      }\n    }\n  }\n": types.BooksDocument,
    "\n  query Catalog($slug: String!) {\n    catalogs(filters: { slug: { eqi: $slug } }, pagination: { limit: 1 }) {\n      documentId\n      title\n      slug\n      summary\n      filters\n    }\n  }\n": types.CatalogDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Book($catalogSlug: String!, $productSlug: String!) {\n    catalogs(\n      filters: { slug: { eqi: $catalogSlug } }\n      pagination: { limit: 1 }\n    ) {\n      documentId\n      title\n      slug\n    }\n    books(filters: { slug: { eqi: $productSlug } }, pagination: { limit: 1 }) {\n      documentId\n      slug\n      title\n      authors {\n        documentId\n        firstName\n        lastName\n      }\n      stockKeepingUnits {\n        documentId\n        condition\n        format\n        edition {\n          documentId\n          name\n          releasedAt\n        }\n        sku {\n          prices {\n            price\n            startAt\n            endAt\n            discounts {\n              action\n              amount\n              startAt\n              endAt\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Book($catalogSlug: String!, $productSlug: String!) {\n    catalogs(\n      filters: { slug: { eqi: $catalogSlug } }\n      pagination: { limit: 1 }\n    ) {\n      documentId\n      title\n      slug\n    }\n    books(filters: { slug: { eqi: $productSlug } }, pagination: { limit: 1 }) {\n      documentId\n      slug\n      title\n      authors {\n        documentId\n        firstName\n        lastName\n      }\n      stockKeepingUnits {\n        documentId\n        condition\n        format\n        edition {\n          documentId\n          name\n          releasedAt\n        }\n        sku {\n          prices {\n            price\n            startAt\n            endAt\n            discounts {\n              action\n              amount\n              startAt\n              endAt\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Books {\n    books {\n      documentId\n      slug\n      title\n      authors {\n        documentId\n        firstName\n        lastName\n      }\n      stockKeepingUnits {\n        documentId\n        condition\n        format\n        sku {\n          prices {\n            price\n            startAt\n            endAt\n            discounts {\n              action\n              amount\n              startAt\n              endAt\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Books {\n    books {\n      documentId\n      slug\n      title\n      authors {\n        documentId\n        firstName\n        lastName\n      }\n      stockKeepingUnits {\n        documentId\n        condition\n        format\n        sku {\n          prices {\n            price\n            startAt\n            endAt\n            discounts {\n              action\n              amount\n              startAt\n              endAt\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Catalog($slug: String!) {\n    catalogs(filters: { slug: { eqi: $slug } }, pagination: { limit: 1 }) {\n      documentId\n      title\n      slug\n      summary\n      filters\n    }\n  }\n"): (typeof documents)["\n  query Catalog($slug: String!) {\n    catalogs(filters: { slug: { eqi: $slug } }, pagination: { limit: 1 }) {\n      documentId\n      title\n      slug\n      summary\n      filters\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;