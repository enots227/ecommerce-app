/** Only the parts of an author a byline reads from. */
interface Named {
  firstName?: string | null;
  lastName?: string | null;
}

/** The byline a product shows, e.g. "Silvia Moreno-Garcia, Ruth Ware". */
export function authorNames(authors: readonly (Named | null)[]): string {
  return authors
    .filter((author) => !!author)
    .map((author) =>
      [author.firstName, author.lastName].filter(Boolean).join(" "),
    )
    .filter((name) => name.length > 0)
    .join(", ");
}
