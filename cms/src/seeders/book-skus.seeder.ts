import { Core } from "@strapi/strapi";
import { faker } from "@faker-js/faker";
import { PromisePool } from "@supercharge/promise-pool";

// Prices are integers in the schema, so they are stored in cents.
const FORMAT_PRICES = {
  HARDCOVER: { min: 2495, max: 3995 },
  TRADE_PAPERBACK: { min: 1595, max: 2495 },
  PAPERBACK: { min: 895, max: 1595 },
} as const;

// Fractions of the new price a copy in each used condition sells for.
const USED_CONDITIONS = {
  PRISTINE: 0.9,
  EXCELLENT: 0.8,
  FINE: 0.7,
  GOOD: 0.6,
  FAIR: 0.45,
  POOR: 0.3,
} as const;

type Format = keyof typeof FORMAT_PRICES;
type UsedCondition = keyof typeof USED_CONDITIONS;
type Condition = UsedCondition | "NEW";

const FORMATS = Object.keys(FORMAT_PRICES) as Format[];
const USED_CONDITION_NAMES = Object.keys(USED_CONDITIONS) as UsedCondition[];
const MIN_USED_PRICE = 495;

// Share of SKUs that are on sale, and how far below the list price that sale is.
const SALE_SHARE = 0.25;
const MIN_SALE_DISCOUNT = 0.1;
const MAX_SALE_DISCOUNT = 0.3;
const CONCURRENCY = 5;

interface BookSkuSeed {
  book: string;
  edition: string;
  format: Format;
  condition: Condition;
  price: number;
  /** When the list price took effect: the day the edition was released. */
  listedAt: string;
}

export async function seedBookSkus(strapi: Core.Strapi): Promise<void> {
  const bookSkus = strapi.documents("api::book-sku.book-sku");
  if ((await bookSkus.count({})) > 0) {
    strapi.log.info("BookSkus have already been seeded");
    return;
  }

  const editions = await strapi
    .documents("api::book-edition.book-edition")
    .findMany({ populate: ["book"] });
  if (editions.length === 0) {
    strapi.log.warn("No book editions found; skipping book SKU seeding");
    return;
  }

  const seeds = editions.flatMap<BookSkuSeed>((edition) => {
    const book = edition.book?.documentId;
    const releasedAt = edition.releasedAt;
    if (!book || !releasedAt) return [];

    // Each edition is printed in one or more formats, priced independently.
    return faker.helpers
      .arrayElements(FORMATS, { min: 1, max: 2 })
      .flatMap((format) => {
        const newPrice = faker.number.int(FORMAT_PRICES[format]);
        const base = {
          book,
          edition: edition.documentId,
          format,
          listedAt: new Date(releasedAt).toISOString(),
        };

        return [
          { ...base, condition: "NEW" as const, price: newPrice },
          ...faker.helpers
            .arrayElements(USED_CONDITION_NAMES, { min: 0, max: 3 })
            .map((condition) => ({
              ...base,
              condition,
              price: Math.max(
                MIN_USED_PRICE,
                Math.round(newPrice * USED_CONDITIONS[condition]),
              ),
            })),
        ];
      });
  });

  await PromisePool.withConcurrency(CONCURRENCY)
    .for(seeds)
    // The pool collects errors by default; rethrow so a failed insert aborts seeding.
    .handleError((error) => {
      throw error;
    })
    .process((seed) => createBookSku(strapi, seed));
  strapi.log.info(`Seeded ${seeds.length} book SKUs`);
}

/** Creates the sellable SKU, its prices, and the book SKU describing it. */
async function createBookSku(
  strapi: Core.Strapi,
  { book, edition, format, condition, price, listedAt }: BookSkuSeed,
): Promise<void> {
  const sku = await strapi.documents("api::sku.sku").create({
    data: { type: "BOOK" },
    status: "published",
  });

  const prices = strapi.documents("api::sku-price.sku-price");
  // The list price is left open-ended, so it applies whenever no sale is running.
  await prices.create({
    data: { skus: sku.documentId, price, startAt: listedAt },
    status: "published",
  });
  if (faker.datatype.boolean({ probability: SALE_SHARE })) {
    await prices.create({
      data: { skus: sku.documentId, ...salePrice(price) },
      status: "published",
    });
  }

  await strapi.documents("api::book-sku.book-sku").create({
    data: { sku: sku.documentId, book, edition, condition, format },
  });
}

/** A sale that started in the last few weeks and runs for a few more. */
function salePrice(listPrice: number): {
  price: number;
  startAt: string;
  endAt: string;
} {
  const discount = faker.number.float({
    min: MIN_SALE_DISCOUNT,
    max: MAX_SALE_DISCOUNT,
  });
  return {
    price: Math.round(listPrice * (1 - discount)),
    startAt: faker.date.recent({ days: 21 }).toISOString(),
    endAt: faker.date.soon({ days: 28 }).toISOString(),
  };
}
