import { graphql } from "@/gql";

export const CatalogLandingPageBySlugQuery = graphql(`
  query CatalogLandingPageBySlug($slug: String!) {
    catalogLandingPages(
      filters: { slug: { eqi: $slug } }
      pagination: { limit: 1 }
    ) {
      documentId
      title
      slug
      summary
      productFilters
    }
  }
`);
