"use client";

import { booksQuery } from "@/lib/queries/books";
import { useQuery } from "@tanstack/react-query";
import { Box } from "@radix-ui/themes/components/box";
import { Flex } from "@radix-ui/themes/components/flex";
import { Grid } from "@radix-ui/themes/components/grid";
import * as Select from "@radix-ui/themes/components/select";
import { Separator } from "@radix-ui/themes/components/separator";
import { Text } from "@radix-ui/themes/components/text";
import { FC } from "react";
import { ProductCard } from "./product-card";

type ProductGridProps = {
  catalogSlug: string;
};

export const ProductGrid: FC<ProductGridProps> = ({ catalogSlug }) => {
  const { data, isPending } = useQuery(booksQuery);

  if (isPending) {
    return (
      <Text size="2" color="gray">
        Loading…
      </Text>
    );
  }

  const books = (data?.books ?? []).filter((book) => !!book);

  if (books.length === 0) {
    return (
      <Text size="2" color="gray">
        No titles found.
      </Text>
    );
  }

  return (
    <Box width="100%">
      <Flex align="center" justify="between" gap="3" wrap="wrap" mb="3">
        <Text size="2" color="gray">
          {books.length} {books.length === 1 ? "item" : "items"}
        </Text>
        <Flex align="center" gap="2">
          <Text size="2" color="gray">
            Sort by
          </Text>
          <Select.Root defaultValue="relevance" size="2">
            <Select.Trigger variant="soft" />
            <Select.Content>
              <Select.Item value="relevance">Relevance</Select.Item>
              <Select.Item value="title">Title</Select.Item>
              <Select.Item value="price-asc">Price: Low to High</Select.Item>
              <Select.Item value="price-desc">Price: High to Low</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>

      <Separator size="4" />

      <Grid
        columns={{ initial: "1", xs: "2", sm: "3", lg: "4" }}
        gapX="5"
        gapY="0"
      >
        {books.map((book) => (
          <ProductCard
            key={`book-${book.documentId}`}
            catalogSlug={catalogSlug}
            book={book}
          />
        ))}
      </Grid>
    </Box>
  );
};
