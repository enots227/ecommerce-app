import { graphql } from "@/gql";

export const CatalogQuery = graphql(`
  query Catalog($urlPath: String!) {
    catalogs(
      filters: { urlPath: { eqi: $urlPath } }
      pagination: { limit: 1 }
    ) {
      documentId
      title
      urlPath
      summary
      layout {
        ... on ComponentGridGrid {
          __typename
          entity
          filters
        }
      }
    }
  }
`);
