import Link from "next/link";
import { Box } from "@radix-ui/themes/components/box";
import { Flex } from "@radix-ui/themes/components/flex";
import { Text } from "@radix-ui/themes/components/text";
import { FC, ReactNode } from "react";
import {
  conditionLabel,
  editionKey,
  editionLabel,
  formatLabel,
  formatPrice,
  type Offer,
} from "@/lib/pricing";

const EDITION_PARAM = "edition";
const FORMAT_PARAM = "format";
const CONDITION_PARAM = "condition";

/**
 * A copy is named in the URL by the labels a shopper reads, so a chosen one
 * can be linked to and shared, e.g.
 * `?edition=Revised Edition&format=Paperback&condition=Used - Good`.
 */
function copyHref(basePath: string, offer: Offer): string {
  const params = new URLSearchParams({
    [EDITION_PARAM]: editionLabel(offer),
    [FORMAT_PARAM]: formatLabel(offer.format),
    [CONDITION_PARAM]: conditionLabel(offer.condition),
  });
  return `${basePath}?${params}`;
}

/** How much of the current selection a copy still matches. */
function kept(offer: Offer, selected: Offer): number {
  return (
    Number(editionKey(offer) === editionKey(selected)) +
    Number(offer.format === selected.format) +
    Number(offer.condition === selected.condition)
  );
}

/**
 * Links to whichever of `candidates` sits closest to what's chosen now, so
 * changing one selector keeps the others wherever that shelf still stocks
 * them. Candidates arrive ranked, so ties fall to the shelf's better copy.
 */
function nearestHref(
  basePath: string,
  candidates: Offer[],
  selected: Offer,
): string {
  const nearest = candidates.reduce((best, offer) =>
    kept(offer, selected) > kept(best, selected) ? offer : best,
  );

  return copyHref(basePath, nearest);
}

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function matches(label: string, param: string | undefined): boolean {
  return !param || label.toLowerCase() === param.toLowerCase();
}

/** Keeps the wider shelf when nothing matches, so a stale param still lands. */
function narrow(copies: Offer[], keep: (offer: Offer) => boolean): Offer[] {
  const kept = copies.filter(keep);
  return kept.length > 0 ? kept : copies;
}

/**
 * The copy the three selectors name. Each narrows what the next chooses from,
 * so a binding the chosen printing doesn't carry settles within that printing
 * rather than jumping to another. Any param missing leads with the best copy.
 */
export function selectCopy(
  copies: Offer[],
  searchParams: SearchParams,
): Offer | undefined {
  const edition = one(searchParams[EDITION_PARAM]);
  const format = one(searchParams[FORMAT_PARAM]);
  const condition = one(searchParams[CONDITION_PARAM]);

  const printing = narrow(copies, (offer) =>
    matches(editionLabel(offer), edition),
  );
  const binding = narrow(printing, (offer) =>
    matches(formatLabel(offer.format), format),
  );

  return (
    binding.find((offer) =>
      matches(conditionLabel(offer.condition), condition),
    ) ?? binding[0]
  );
}

function group<Key>(
  copies: Offer[],
  keyOf: (offer: Offer) => Key,
): [Key, Offer[]][] {
  const groups = new Map<Key, Offer[]>();

  for (const offer of copies) {
    const group = groups.get(keyOf(offer));
    if (group) group.push(offer);
    else groups.set(keyOf(offer), [offer]);
  }

  return [...groups];
}

/** Printings read in the order they were published; undated ones sort last. */
function byEdition(copies: Offer[]): [string, Offer[]][] {
  return group(copies, editionKey).sort(
    ([, a], [, b]) => releasedAt(a[0]) - releasedAt(b[0]),
  );
}

function releasedAt(offer: Offer): number {
  const released = offer.edition?.releasedAt;
  const parsed = released ? Date.parse(released) : NaN;
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

/** Bindings run cheapest first, the way the copies within one already do. */
function byFormat(copies: Offer[]): [string, Offer[]][] {
  return group(copies, (offer) => offer.format).sort(
    ([, a], [, b]) => lowest(a) - lowest(b),
  );
}

function lowest(copies: Offer[]): number {
  return Math.min(...copies.map((offer) => offer.price));
}

function highest(copies: Offer[]): number {
  return Math.max(...copies.map((offer) => offer.price));
}

/** What a shelf costs across the copies on it, e.g. "$3.22 – $10.74". */
function priceRange(copies: Offer[]): string {
  const low = lowest(copies);
  const high = highest(copies);
  return low === high
    ? formatPrice(low)
    : `${formatPrice(low)} – ${formatPrice(high)}`;
}

type OptionProps = {
  href: string;
  label: string;
  selected: boolean;
  /** The price line: a range for a shelf, a single price for one copy. */
  children: ReactNode;
};

const Option: FC<OptionProps> = ({ href, label, selected, children }) => (
  <Flex
    asChild
    direction="column"
    gap="1"
    px="3"
    py="2"
    minWidth="140px"
    className="rounded-md transition-colors hover:bg-(--gray-a2)"
    style={{
      border: "1px solid var(--gray-a6)",
      ...(selected && {
        borderColor: "var(--accent-9)",
        boxShadow: "inset 0 0 0 1px var(--accent-9)",
        backgroundColor: "var(--accent-a2)",
      }),
    }}
  >
    <Link
      href={href}
      scroll={false}
      aria-current={selected ? "true" : undefined}
    >
      <Text size="2" weight={selected ? "bold" : "regular"}>
        {label}
      </Text>
      {children}
    </Link>
  </Flex>
);

const Selector: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => (
  <Box>
    <Text as="p" size="2" weight="bold" mb="2">
      {label}
    </Text>
    <Flex gap="2" wrap="wrap" align="stretch">
      {children}
    </Flex>
  </Box>
);

type CopyOptionsProps = {
  copies: Offer[];
  selected: Offer;
  /** The product page's own path, which each option links back to. */
  basePath: string;
};

export const CopyOptions: FC<CopyOptionsProps> = ({
  copies,
  selected,
  basePath,
}) => {
  const editions = byEdition(copies);
  // Each selector offers what the one above it narrowed down to.
  const inEdition = copies.filter(
    (offer) => editionKey(offer) === editionKey(selected),
  );
  const bindings = byFormat(inEdition);
  const conditions = inEdition.filter(
    (offer) => offer.format === selected.format,
  );

  return (
    <Flex direction="column" gap="4">
      {editions.length > 1 && (
        <Selector label="Edition">
          {editions.map(([key, editionCopies]) => (
            <Option
              key={key}
              href={nearestHref(basePath, editionCopies, selected)}
              label={editionLabel(editionCopies[0])}
              selected={key === editionKey(selected)}
            >
              <Text size="1" color="gray">
                {priceRange(editionCopies)}
              </Text>
            </Option>
          ))}
        </Selector>
      )}

      <Selector label="Format">
        {bindings.map(([format, bindingCopies]) => (
          <Option
            key={format}
            href={nearestHref(basePath, bindingCopies, selected)}
            label={formatLabel(bindingCopies[0].format)}
            selected={format === selected.format}
          >
            <Text size="1" color="gray">
              {priceRange(bindingCopies)}
            </Text>
          </Option>
        ))}
      </Selector>

      <Selector label="Condition">
        {conditions.map((offer) => (
          <Option
            key={offer.id}
            href={copyHref(basePath, offer)}
            label={conditionLabel(offer.condition)}
            selected={offer.id === selected.id}
          >
            <Flex align="baseline" gap="2">
              {offer.listPrice && (
                <Text
                  size="1"
                  color="gray"
                  style={{ textDecoration: "line-through" }}
                >
                  {formatPrice(offer.listPrice)}
                </Text>
              )}
              <Text size="1" color="gray">
                {formatPrice(offer.price)}
              </Text>
            </Flex>
          </Option>
        ))}
      </Selector>
    </Flex>
  );
};
