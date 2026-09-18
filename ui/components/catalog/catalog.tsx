import Link from "next/link";
import { Box } from "@radix-ui/themes/components/box";
import { Container } from "@radix-ui/themes/components/container";
import { Flex } from "@radix-ui/themes/components/flex";
import { Heading } from "@radix-ui/themes/components/heading";
import { Text } from "@radix-ui/themes/components/text";
import { EntityGrid } from "@/components/catalog/grid";
import { FC } from "react";
import { CatalogQuery } from "@/gql/graphql";

type CatalogProps = Exclude<CatalogQuery["catalogs"][number], null>;

export const Catalog: FC<CatalogProps> = async ({ title, layout }) => {
  return (
    <Container size="4" px="5" py="6">
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <Text size="1" color="gray" asChild>
            <Link href="/books">Books</Link>
          </Text>
          <Text size="1" color="gray">
            /
          </Text>
          <Text size="1" color="gray">
            {title}
          </Text>
        </Flex>

        <Box>
          <Heading as="h1" size="7">
            {title}
          </Heading>
        </Box>

        {layout
          ?.filter((i) => !!i)
          .map(({ __typename, ...rest }) => {
            switch (__typename) {
              case "ComponentGridGrid": {
                const { entity, filters } = rest;
                return <EntityGrid entity={entity} filters={filters} />;
              }
            }
          })}
      </Flex>
    </Container>
  );
};
