import { Badge } from "@radix-ui/themes/components/badge";
import { Box } from "@radix-ui/themes/components/box";
import { Button } from "@radix-ui/themes/components/button";
import { Card } from "@radix-ui/themes/components/card";
import { Flex } from "@radix-ui/themes/components/flex";
import { Separator } from "@radix-ui/themes/components/separator";
import { Text } from "@radix-ui/themes/components/text";
import { FC } from "react";
import {
  conditionLabel,
  formatLabel,
  formatPrice,
  savingsPercent,
  type Offer,
} from "@/lib/pricing";

type BuyBoxProps = {
  offer: Offer;
  /** The printing the chosen copy comes from, when the SKU records one. */
  edition?: string | null;
};

export const BuyBox: FC<BuyBoxProps> = ({ offer, edition }) => {
  const savings = savingsPercent(offer);

  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Flex align="center" gap="2" wrap="wrap">
          <Badge size="2" color={offer.condition === "NEW" ? "tomato" : "gray"}>
            {conditionLabel(offer.condition)}
          </Badge>
          <Text size="2" color="gray">
            {formatLabel(offer.format)}
          </Text>
          {edition && (
            <>
              <Text size="2" color="gray">
                ·
              </Text>
              <Text size="2" color="gray">
                {edition}
              </Text>
            </>
          )}
        </Flex>

        <Flex align="baseline" gap="3" wrap="wrap">
          <Text size="8" weight="bold">
            {formatPrice(offer.price)}
          </Text>
          {offer.listPrice && (
            <Text
              size="3"
              color="gray"
              style={{ textDecoration: "line-through" }}
            >
              {formatPrice(offer.listPrice)}
            </Text>
          )}
          {savings !== null && savings > 0 && (
            <Badge size="2" color="green">
              Save {savings}%
            </Badge>
          )}
        </Flex>

        <Separator size="4" />

        {/* @todo wire to the cart once the storefront has one */}
        <Flex direction="column" gap="2">
          <Button size="3">Add to Cart</Button>
          <Button size="3" variant="soft" color="gray">
            Add to Wish List
          </Button>
        </Flex>

        <Box>
          <Text as="p" size="1" color="gray">
            Ships in 1 to 3 days
          </Text>
          <Text as="p" size="1" color="gray">
            Free shipping on orders over $50
          </Text>
        </Box>
      </Flex>
    </Card>
  );
};
