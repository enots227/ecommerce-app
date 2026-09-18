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
import { CatalogQuery } from "@/lib/queries/catalog";
import { cms } from "@/lib/cms";
import { PRODUCT_TYPE_TO_LABEL, productTypeFromSlug } from "@/lib/product-type";
import { booksQuery } from "@/lib/queries/books";

type PageProps = {
  params: Promise<{ productType: string; catalog: string }>;
};

export default async function Page({ params }: PageProps) {
  const slugs = await params;
  const productType = productTypeFromSlug(slugs.productType);

  if (!productType) {
    notFound();
  }

  const queryClient = new QueryClient();

  const data = await cms.request(CatalogQuery, {
    slug: slugs.catalog,
  });
  const catalog = data.catalogs[0];

  if (!catalog) {
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
              {catalog.title}
            </Text>
          </Flex>

          <Box>
            <Heading as="h1" size="7">
              {catalog.title}
            </Heading>
          </Box>

          <ProductGrid catalogSlug={slugs.catalog} />
        </Flex>
      </Container>
    </HydrationBoundary>
  );
}
