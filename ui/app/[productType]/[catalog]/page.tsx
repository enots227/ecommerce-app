import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { CatalogQuery } from "@/lib/queries/catalog";
import { cms } from "@/lib/cms";
import { productTypeFromSlug } from "@/lib/product-type";
import { booksQuery } from "@/lib/queries/books";
import { Catalog } from "@/components/catalog/catalog";

type PageProps = {
  params: Promise<{ productType: string; catalog: string }>;
};

export default async function Page({ params }: PageProps) {
  const slugs = await params;
  const productType = productTypeFromSlug(slugs.productType);

  if (!productType) {
    notFound();
  }

  const queryClient = new QueryClient();

  const data = await cms.request(CatalogQuery, {
    urlPath: `/${slugs.productType}/${slugs.catalog}/`,
  });
  const catalog = data.catalogs[0];

  if (!catalog) {
    notFound();
  }

  await queryClient.query(booksQuery);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Catalog {...catalog} />
    </HydrationBoundary>
  );
}
