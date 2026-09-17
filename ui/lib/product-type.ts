// @todo better product type definition generation
export enum ProductType {
  BOOK = "BOOK",
}

export const PRODUCT_TYPE_TO_LABEL = {
  [ProductType.BOOK]: {
    one: "Book",
    other: "Books",
  },
} as const satisfies Record<
  ProductType,
  Partial<Record<Intl.LDMLPluralRule, string>>
>;

export const PRODUCT_SLUG_TO_TYPE = {
  books: ProductType.BOOK,
};

/** The type a `/[productType]` segment names, or undefined when it names none. */
export function productTypeFromSlug(slug: string): ProductType | undefined {
  return PRODUCT_SLUG_TO_TYPE[slug as keyof typeof PRODUCT_SLUG_TO_TYPE];
}
