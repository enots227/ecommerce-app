import { queryOptions } from "@tanstack/react-query";
import { graphql } from "@/gql";
import { cms } from "@/lib/cms";

const BooksQuery = graphql(`
  query Books {
    books {
      documentId
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

export const booksQuery = queryOptions({
  queryKey: ["books"],
  queryFn: () => cms.request(BooksQuery),
});
