import Image from "next/image";
import Link from "next/link";
import { Badge } from "@radix-ui/themes/components/badge";
import { Box } from "@radix-ui/themes/components/box";
import { Flex } from "@radix-ui/themes/components/flex";
import { Separator } from "@radix-ui/themes/components/separator";
import { Text } from "@radix-ui/themes/components/text";
import { FC } from "react";
import { BooksQuery } from "@/gql/graphql";
import { authorNames } from "@/lib/authors";
import {
  conditionLabel,
  featuredOffer,
  formatLabel,
  formatPrice,
} from "@/lib/pricing";

type Book = NonNullable<BooksQuery["books"][number]>;

export const ProductCard: FC<{ catalogSlug?: string; book: Book }> = ({
  catalogSlug = "-",
  book,
}) => {
  const byline = authorNames(book.authors);
  const offer = featuredOffer(book);

  return (
    <Link
      href={`/books/${catalogSlug}/${book.slug}`}
      className="rounded-md border border-(--gray-a6) transition-colors hover:bg-(--gray-a2) active:bg-(--gray-a3)"
    >
      <Flex direction="column" gap="3" px="3" py="4" height="100%">
        <Box position="relative" width="100%" height="230px">
          <Image
            src="/book-cover-placeholder.svg"
            alt={book.title ?? "Book cover"}
            fill
            sizes="(max-width: 768px) 45vw, 220px"
            style={{ objectFit: "contain" }}
          />
        </Box>

        <Flex direction="column" gap="1">
          <Text size="2" weight="bold">
            {book.title}
          </Text>
          {byline && (
            <Text size="2" color="gray">
              by {byline}
            </Text>
          )}
        </Flex>

        <Box flexGrow="1" />

        <Separator
          size="4"
          mx="-3"
          style={{ width: "calc(100% + 2 * var(--space-3))" }}
        />

        {offer ? (
          <Box>
            <Flex align="center" gap="2" mb="1" wrap="wrap">
              <Badge
                size="1"
                color={offer.condition === "NEW" ? "tomato" : "gray"}
              >
                {conditionLabel(offer.condition)}
              </Badge>
              <Text size="1" color="gray">
                {formatLabel(offer.format)}
              </Text>
            </Flex>
            <Flex align="baseline" gap="2" wrap="wrap">
              <Text size="1" color="gray">
                From
              </Text>
              {offer.listPrice && (
                <Text
                  size="1"
                  color="gray"
                  style={{ textDecoration: "line-through" }}
                >
                  {formatPrice(offer.listPrice)}
                </Text>
              )}
              <Text size="2" weight="bold">
                {formatPrice(offer.price)}
              </Text>
            </Flex>
          </Box>
        ) : (
          <Text size="1" color="gray">
            Currently unavailable
          </Text>
        )}
      </Flex>
    </Link>
  );
};
