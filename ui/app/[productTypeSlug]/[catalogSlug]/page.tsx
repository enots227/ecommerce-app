import Link from "next/link";
import { notFound } from "next/navigation";
import { Box } from "@radix-ui/themes/components/box";
import { Container } from "@radix-ui/themes/components/container";
import { Flex } from "@radix-ui/themes/components/flex";
import { Heading } from "@radix-ui/themes/components/heading";
import { Text } from "@radix-ui/themes/components/text";
import { ProductGrid } from "./product-grid";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { CatalogLandingPageBySlugQuery } from "@/lib/queries/catalog-landing-page";
import { cms } from "@/lib/cms";
import { booksQuery } from "@/lib/queries/books";

// @todo better product type definition generation
enum ProductType {
  BOOK = "BOOK",
}

const PRODUCT_TYPE_TO_LABEL = {
  [ProductType.BOOK]: {
    one: "Book",
    other: "Books",
  },
} as const satisfies Record<
  ProductType,
  Partial<Record<Intl.LDMLPluralRule, string>>
>;

const PRODUCT_SLUG_TO_TYPE = {
  books: ProductType.BOOK,
};

type PageProps = {
  params: Promise<{ productTypeSlug: string; catalogSlug: string }>;
};

export default async function Page({ params }: PageProps) {
  const { productTypeSlug, catalogSlug } = await params;
  const productType =
    PRODUCT_SLUG_TO_TYPE[productTypeSlug as keyof typeof PRODUCT_SLUG_TO_TYPE];

  const queryClient = new QueryClient();

  const data = await cms.request(CatalogLandingPageBySlugQuery, {
    slug: catalogSlug,
  });
  const page = data.catalogLandingPages[0];

  if (!page) {
    notFound();
  }

  await queryClient.query(booksQuery);

  const productTypeLabel = PRODUCT_TYPE_TO_LABEL[productType];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container size="4" px="5" py="6">
        <Flex direction="column" gap="4">
          <Flex align="center" gap="2">
            <Text size="1" color="gray" asChild>
              <Link href="/books">{productTypeLabel.other}</Link>
            </Text>
            <Text size="1" color="gray">
              /
            </Text>
            <Text size="1" color="gray">
              {page.title}
            </Text>
          </Flex>

          <Box>
            <Heading as="h1" size="7">
              {page.title}
            </Heading>
          </Box>

          <ProductGrid />
        </Flex>
      </Container>
    </HydrationBoundary>
  );
}
