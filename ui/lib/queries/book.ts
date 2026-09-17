import { graphql } from "@/gql";

export const BookQuery = graphql(`
  query Book($catalogSlug: String!, $productSlug: String!) {
    catalogLandingPages(
      filters: { slug: { eqi: $catalogSlug } }
      pagination: { limit: 1 }
    ) {
      documentId
      title
      slug
    }
    books(filters: { slug: { eqi: $productSlug } }, pagination: { limit: 1 }) {
      documentId
      slug
      title
      authors {
        documentId
        firstName
        lastName
      }
      stockKeepingUnits {
        documentId
        condition
        format
        edition {
          documentId
          name
          releasedAt
        }
        sku {
          prices {
            price
            startAt
            endAt
            discounts {
              action
              amount
              startAt
              endAt
            }
          }
        }
      }
    }
  }
`);
