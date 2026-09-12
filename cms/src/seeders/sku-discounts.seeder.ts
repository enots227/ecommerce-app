import { Core } from "@strapi/strapi";
import { faker } from "@faker-js/faker";
import { PromisePool } from "@supercharge/promise-pool";

// Share of SKUs carrying a promotion, and the share of those taking a flat
// amount off rather than a percentage.
const DISCOUNTED_SHARE = 0.2;
const PRICE_REDUCTION_SHARE = 0.4;

// Flat reductions are whole dollars, and never take more than half the price.
const MIN_REDUCTION = 100;
const MAX_REDUCTION = 1000;
const MAX_REDUCTION_SHARE = 0.5;

// Percentages are whole percents, in the steps a storefront advertises.
const PERCENTAGES = [5, 10, 15, 20, 25, 30, 40, 50];

const CONCURRENCY = 5;

interface SkuPrice {
  documentId: string;
  price: number | null;
  startAt: string | null;
  endAt: string | null;
}

type PricedSkuPrice = SkuPrice & { price: number };

interface SkuDiscountSeed {
  skuPrice: string;
  type: "PROMOTIONAL";
  action: "PRICE_REDUCTION" | "DISCOUNT_PERCENTAGE";
  /** Cents off for a price reduction, whole percent off for a percentage. */
  amount: number;
  startAt: string;
  endAt: string;
}

export async function seedSkuDiscounts(strapi: Core.Strapi): Promise<void> {
  const discounts = strapi.documents("api::sku-discount.sku-discount");
  if ((await discounts.count({})) > 0) return;

  const skus = await strapi
    .documents("api::sku.sku")
    .findMany({ populate: ["prices"] });
  if (skus.length === 0) {
    strapi.log.warn("No SKUs found; skipping SKU discount seeding");
    return;
  }

  const now = Date.now();
  const seeds = faker.helpers
    .arrayElements(skus, Math.round(skus.length * DISCOUNTED_SHARE))
    .flatMap<SkuDiscountSeed>((sku) => {
      // A promotion comes off whatever the SKU is selling for today.
      const price = effectivePrice((sku.prices ?? []) as SkuPrice[], now);
      if (!price) return [];

      return [
        {
          skuPrice: price.documentId,
          type: "PROMOTIONAL",
          ...promotion(price.price),
          ...promotionWindow(),
        },
      ];
    });

  await PromisePool.withConcurrency(CONCURRENCY)
    .for(seeds)
    // The pool collects errors by default; rethrow so a failed insert aborts seeding.
    .handleError((error) => {
      throw error;
    })
    .process((data) => discounts.create({ data, status: "published" }));
  strapi.log.info(`Seeded ${seeds.length} SKU discounts`);
}

/** The price a SKU is charging right now: the lowest of those currently in effect. */
function effectivePrice(prices: SkuPrice[], at: number): PricedSkuPrice | null {
  return prices
    .filter((price): price is PricedSkuPrice => price.price !== null)
    .filter((price) => !price.startAt || Date.parse(price.startAt) <= at)
    // A standing list price has no end date, so it applies whenever no sale is running.
    .filter((price) => !price.endAt || Date.parse(price.endAt) > at)
    .reduce<PricedSkuPrice | null>(
      (lowest, price) => (!lowest || price.price < lowest.price ? price : lowest),
      null,
    );
}

/** Takes either a flat amount or a percentage off, never more than half the price. */
function promotion(price: number): Pick<SkuDiscountSeed, "action" | "amount"> {
  const maxReduction = Math.min(
    MAX_REDUCTION,
    Math.floor((price * MAX_REDUCTION_SHARE) / 100) * 100,
  );
  // A copy too cheap to take a whole dollar off gets a percentage instead.
  if (
    maxReduction >= MIN_REDUCTION &&
    faker.datatype.boolean({ probability: PRICE_REDUCTION_SHARE })
  ) {
    return {
      action: "PRICE_REDUCTION",
      amount:
        faker.number.int({
          min: MIN_REDUCTION / 100,
          max: maxReduction / 100,
        }) * 100,
    };
  }

  return {
    action: "DISCOUNT_PERCENTAGE",
    amount: faker.helpers.arrayElement(PERCENTAGES),
  };
}

/** A promotion that started in the last few weeks and runs for a few more. */
function promotionWindow(): Pick<SkuDiscountSeed, "startAt" | "endAt"> {
  return {
    startAt: faker.date.recent({ days: 21 }).toISOString(),
    endAt: faker.date.soon({ days: 28 }).toISOString(),
  };
}
