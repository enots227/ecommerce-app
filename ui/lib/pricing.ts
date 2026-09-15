import type {
  BooksQuery,
  Enum_Booksku_Condition,
  Enum_Booksku_Format,
} from "@/gql/graphql";

type Book = NonNullable<BooksQuery["books"][number]>;
type BookSku = NonNullable<Book["stockKeepingUnits"][number]>;
type SkuPrice = NonNullable<BookSku["sku"]["prices"][number]>;
type SkuDiscount = NonNullable<SkuPrice["discounts"][number]>;
type PricedSkuPrice = SkuPrice & { price: number };

/** Anything that applies only between two dates. */
interface Dated {
  startAt?: string | null;
  endAt?: string | null;
}

/** The offer a card leads with, and the price it undercuts. */
export interface Offer {
  condition: Enum_Booksku_Condition;
  format: Enum_Booksku_Format;
  /** Cents, after any promotion. */
  price: number;
  /** Cents before the promotion, only when one is running. */
  listPrice?: number;
}

/**
 * Conditions best first. This follows the grading the seeder prices against
 * (a Fine copy sells above a Good one), not the order the CMS enum lists.
 */
const CONDITIONS: Enum_Booksku_Condition[] = [
  "NEW",
  "PRISTINE",
  "EXCELLENT",
  "FINE",
  "GOOD",
  "FAIR",
  "POOR",
];

/** Formats cheapest first. */
const FORMATS: Enum_Booksku_Format[] = [
  "PAPERBACK",
  "TRADE_PAPERBACK",
  "HARDCOVER",
];

const CONDITION_LABELS: Record<Enum_Booksku_Condition, string> = {
  NEW: "New",
  PRISTINE: "Pristine",
  EXCELLENT: "Excellent",
  FINE: "Fine",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

const FORMAT_LABELS: Record<Enum_Booksku_Format, string> = {
  HARDCOVER: "Hardcover",
  TRADE_PAPERBACK: "Trade Paperback",
  PAPERBACK: "Paperback",
};

/** Every condition but `NEW` describes a used copy, e.g. "Used - Good". */
export function conditionLabel(condition: Enum_Booksku_Condition): string {
  const label = CONDITION_LABELS[condition];
  return condition === "NEW" ? label : `Used - ${label}`;
}

export function formatLabel(format: Enum_Booksku_Format): string {
  return FORMAT_LABELS[format];
}

/** Prices are stored in cents. */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function isActive(dated: Dated, at: number): boolean {
  if (dated.startAt && Date.parse(dated.startAt) > at) return false;
  // A standing price has no end date, so it applies until one supersedes it.
  if (dated.endAt && Date.parse(dated.endAt) <= at) return false;
  return true;
}

/** Applies one promotion, in cents off for a reduction or whole percent otherwise. */
function discounted(price: number, discount: SkuDiscount): number {
  if (discount.amount === null) return price;
  switch (discount.action) {
    case "PRICE_REDUCTION":
      return Math.max(0, price - discount.amount);
    case "DISCOUNT_PERCENTAGE":
      return Math.max(0, Math.round(price * (1 - discount.amount / 100)));
    default:
      return price;
  }
}

function skuOffer(bookSku: BookSku, at: number): Offer | null {
  const active = bookSku.sku.prices
    .filter((skuPrice): skuPrice is PricedSkuPrice => skuPrice?.price != null)
    .filter((skuPrice) => isActive(skuPrice, at));
  if (active.length === 0) return null;

  // The lowest price in effect is what the SKU sells for before any promotion.
  const listPrice = active.reduce((lowest, skuPrice) =>
    skuPrice.price < lowest.price ? skuPrice : lowest,
  );

  // Promotions don't stack: whichever running one saves the most is the one applied.
  const price = listPrice.discounts
    .filter((discount) => !!discount)
    .filter((discount) => isActive(discount, at))
    .reduce(
      (lowest, discount) => Math.min(lowest, discounted(listPrice.price, discount)),
      listPrice.price,
    );

  return {
    condition: bookSku.condition,
    format: bookSku.format,
    price,
    ...(price < listPrice.price && { listPrice: listPrice.price }),
  };
}

/**
 * Ranks offers the way a card leads with them: the best condition on the shelf
 * first, then the cheapest format, then the cheapest copy of that pairing.
 */
function compareOffers(a: Offer, b: Offer): number {
  return (
    CONDITIONS.indexOf(a.condition) - CONDITIONS.indexOf(b.condition) ||
    FORMATS.indexOf(a.format) - FORMATS.indexOf(b.format) ||
    a.price - b.price
  );
}

/**
 * The offer a book's card leads with, or null when none are for sale. Other
 * offers stay available on the book page, so the price reads as a starting one.
 */
export function featuredOffer(book: Book, at: number = Date.now()): Offer | null {
  return book.stockKeepingUnits
    .filter((bookSku) => !!bookSku)
    .map((bookSku) => skuOffer(bookSku, at))
    .filter((offer) => !!offer)
    .reduce<Offer | null>(
      (best, offer) => (!best || compareOffers(offer, best) < 0 ? offer : best),
      null,
    );
}
