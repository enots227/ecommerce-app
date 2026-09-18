import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@radix-ui/themes/components/badge";
import { Box } from "@radix-ui/themes/components/box";
import { Container } from "@radix-ui/themes/components/container";
import * as DataList from "@radix-ui/themes/components/data-list";
import { Flex } from "@radix-ui/themes/components/flex";
import { Grid } from "@radix-ui/themes/components/grid";
import { Heading } from "@radix-ui/themes/components/heading";
import { Separator } from "@radix-ui/themes/components/separator";
import { Text } from "@radix-ui/themes/components/text";
import { authorNames } from "@/lib/authors";
import { cms } from "@/lib/cms";
import { conditionLabel, copies, formatLabel } from "@/lib/pricing";
import { PRODUCT_TYPE_TO_LABEL, productTypeFromSlug } from "@/lib/product-type";
import { BookQuery } from "@/lib/queries/book";
import { BooksQuery } from "@/lib/queries/books";
import { EntityCard } from "@/components/catalog/card/card";
import { BuyBox } from "./buy-box";
import { CopyOptions, selectCopy } from "./copy-options";
import { FormattedMessage } from "react-intl";

/** How many other titles the page recommends at the bottom. */
const RELATED_LIMIT = 4;

const RELEASE_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  // Editions carry a plain `YYYY-MM-DD`, which would slip a day in a negative offset.
  timeZone: "UTC",
});

function formatReleaseDate(date?: string | null): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? null
    : RELEASE_DATE_FORMAT.format(parsed);
}

type PageProps = {
  params: Promise<{
    productType: string;
    catalog: string;
    product: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const slugs = await params;
  const productType = productTypeFromSlug(slugs.productType);

  if (!productType) {
    notFound();
  }

  const data = await cms.request(BookQuery, {
    catalogUrlPath: `/books/${slugs.catalog}/`,
    productSlug: slugs.product,
  });
  const catalog = data.catalogs[0];
  const book = data.books[0];

  if (!catalog || !book) {
    notFound();
  }

  const productTypeLabel = PRODUCT_TYPE_TO_LABEL[productType];
  const catalogPath = `/${slugs.productType}/${slugs.catalog}`;
  const productPath = `${catalogPath}/${slugs.product}`;

  const byline = authorNames(book.authors);
  const categories = book.categories.filter((category) => !!category);
  const available = copies(book);
  const selected = selectCopy(available, await searchParams);
  const releasedAt = formatReleaseDate(selected?.edition?.releasedAt);

  const related = (await cms.request(BooksQuery)).books
    .filter((other) => !!other)
    .filter((other) => other.documentId !== book.documentId)
    .slice(0, RELATED_LIMIT);

  return (
    <Container size="4" px="5" py="6">
      <Flex align="center" gap="2" mb="5" wrap="wrap">
        <Text size="1" color="gray" asChild>
          <Link href={`/${slugs.productType}`}>{productTypeLabel.other}</Link>
        </Text>
        <Text size="1" color="gray">
          /
        </Text>
        <Text size="1" color="gray" asChild>
          <Link href={catalogPath}>{catalog.title}</Link>
        </Text>
        <Text size="1" color="gray">
          /
        </Text>
        <Text size="1" color="gray">
          {book.title}
        </Text>
      </Flex>

      <Grid
        columns={{
          initial: "1",
          sm: "240px minmax(0, 1fr)",
          md: "300px minmax(0, 1fr)",
        }}
        gap="6"
        align="start"
      >
        <Box
          position="relative"
          width="100%"
          style={{ aspectRatio: "2 / 3", maxWidth: "300px" }}
        >
          <Image
            src="/book-cover-placeholder.svg"
            alt={`Cover of ${book.title}`}
            fill
            sizes="(max-width: 768px) 60vw, 300px"
            style={{ objectFit: "contain" }}
            priority
          />
        </Box>

        <Flex direction="column" gap="5">
          <Box>
            <Heading as="h1" size="7" mb="1">
              {book.title}
            </Heading>
            {byline && (
              <Text as="p" size="3" color="gray">
                by {byline}
              </Text>
            )}
            {categories.length > 0 && (
              <Flex gap="2" mt="3" wrap="wrap">
                {categories.map((category) => (
                  <Badge
                    key={category.documentId}
                    size="2"
                    color="gray"
                    className="transition-colors hover:bg-(--accent-a4) active:bg-(--accent-a5)"
                    asChild
                  >
                    <Link href={category.catalog.urlPath}>
                      {category.title}
                    </Link>
                  </Badge>
                ))}
              </Flex>
            )}
          </Box>

          {selected ? (
            <>
              <BuyBox offer={selected} edition={selected.edition?.name} />
              <CopyOptions
                copies={available}
                selected={selected}
                basePath={productPath}
              />
            </>
          ) : (
            <Text size="2" color="gray">
              Currently unavailable
            </Text>
          )}

          <Separator size="4" />

          <Box>
            <Heading as="h2" size="4" mb="3">
              Product Details
            </Heading>
            <DataList.Root size="2" orientation="vertical">
              {byline && (
                <DataList.Item>
                  <DataList.Label>
                    <FormattedMessage
                      id="authorLabel"
                      defaultMessage="Author"
                      values={{ count: book.authors.length }}
                    />
                  </DataList.Label>
                  <DataList.Value>{byline}</DataList.Value>
                </DataList.Item>
              )}
              {selected && (
                <>
                  <DataList.Item>
                    <DataList.Label>Binding</DataList.Label>
                    <DataList.Value>
                      {formatLabel(selected.format)}
                    </DataList.Value>
                  </DataList.Item>
                  <DataList.Item>
                    <DataList.Label>Condition</DataList.Label>
                    <DataList.Value>
                      {conditionLabel(selected.condition)}
                    </DataList.Value>
                  </DataList.Item>
                </>
              )}
              {selected?.edition?.name && (
                <DataList.Item>
                  <DataList.Label>Edition</DataList.Label>
                  <DataList.Value>{selected.edition.name}</DataList.Value>
                </DataList.Item>
              )}
              {releasedAt && (
                <DataList.Item>
                  <DataList.Label>Publication date</DataList.Label>
                  <DataList.Value>{releasedAt}</DataList.Value>
                </DataList.Item>
              )}
            </DataList.Root>
          </Box>
        </Flex>
      </Grid>

      {related.length > 0 && (
        <Box mt="8">
          <Heading as="h2" size="4" mb="1">
            More in {catalog.title}
          </Heading>
          <Separator size="4" />
          <Grid columns={{ initial: "2", sm: "4" }} gapX="5" gapY="0">
            {related.map((other) => (
              <EntityCard key={`book-${other.documentId}`} book={other} />
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}
