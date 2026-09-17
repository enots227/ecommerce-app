import type {
  BooksQuery,
  Enum_Booksku_Condition,
  Enum_Booksku_Format,
} from "@/gql/graphql";

type QueriedBookSku = NonNullable<
  NonNullable<BooksQuery["books"][number]>["stockKeepingUnits"][number]
>;

/** The printing a copy belongs to. Only the product page selects one. */
export interface Edition {
  documentId: string;
  name?: string | null;
  releasedAt?: string | null;
}

/** A copy carries its edition only where the query asked for one. */
type BookSku = QueriedBookSku & { edition?: Edition | null };

/** Only the part of a book its prices are read from. */
interface Book {
  stockKeepingUnits: Array<BookSku | null>;
}

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
  /** The BookSku this copy sells as, so a page can link back to the record. */
  id: string;
  condition: Enum_Booksku_Condition;
  format: Enum_Booksku_Format;
  /** The printing this copy is of, where the query selected it. */
  edition?: Edition | null;
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
    id: bookSku.documentId,
    condition: bookSku.condition,
    format: bookSku.format,
    edition: bookSku.edition,
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

/** Every copy of a book currently for sale, the one to lead with first. */
export function offers(book: Book, at: number = Date.now()): Offer[] {
  return book.stockKeepingUnits
    .filter((bookSku) => !!bookSku)
    .map((bookSku) => skuOffer(bookSku, at))
    .filter((offer) => !!offer)
    .sort(compareOffers);
}

/**
 * The copies a product page lists to choose between: one per edition, format
 * and condition, priced at the cheapest copy of that combination on the shelf.
 * A shopper picks a printing, a binding and a grade, not an individual SKU.
 */
export function copies(book: Book, at: number = Date.now()): Offer[] {
  const cheapest = new Map<string, Offer>();

  for (const offer of offers(book, at)) {
    const copy = `${editionKey(offer)}-${offer.format}-${offer.condition}`;
    const held = cheapest.get(copy);
    if (!held || offer.price < held.price) cheapest.set(copy, offer);
  }

  return [...cheapest.values()].sort(compareOffers);
}

/** Identifies the printing a copy is of, for grouping copies by edition. */
export function editionKey(offer: Offer): string {
  return offer.edition?.documentId ?? "";
}

/** What an edition is called, for copies whose SKU records no printing. */
export function editionLabel(offer: Offer): string {
  return offer.edition?.name?.trim() || "Standard Edition";
}

/**
 * The offer a book's card leads with, or null when none are for sale. Other
 * offers stay available on the book page, so the price reads as a starting one.
 */
export function featuredOffer(book: Book, at: number = Date.now()): Offer | null {
  return offers(book, at)[0] ?? null;
}

/** Whole percent off the list price, or null when the copy isn't promoted. */
export function savingsPercent(offer: Offer): number | null {
  if (!offer.listPrice) return null;
  return Math.round((1 - offer.price / offer.listPrice) * 100);
}
