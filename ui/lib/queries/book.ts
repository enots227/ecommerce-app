import { graphql } from "@/gql";

export const BookQuery = graphql(`
  query Book($catalogUrlPath: String!, $productSlug: String!) {
    catalogs(
      filters: { urlPath: { eqi: $catalogUrlPath } }
      pagination: { limit: 1 }
    ) {
      documentId
      title
      urlPath
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
      categories {
        documentId
        title
        catalog {
          documentId
          urlPath
        }
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
