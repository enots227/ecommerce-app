import { graphql } from "@/gql";

export const CatalogQuery = graphql(`
  query Catalog($slug: String!) {
    catalogs(filters: { slug: { eqi: $slug } }, pagination: { limit: 1 }) {
      documentId
      title
      slug
      summary
      productFilters
    }
  }
`);
