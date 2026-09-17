"use client";

import { IntlData } from "@/intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { FC, useState, type ReactNode } from "react";
import { IntlProvider } from "react-intl";

const TanStackQueryProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Created in state so each browser session gets one client and server requests never share one.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          // Don't refetch immediately on the client after server rendering.
          queries: { staleTime: 60 * 1000 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export const Providers: FC<{ children: ReactNode; intl: IntlData }> = ({
  children,
  intl: { lang, messages },
}) => (
  <TanStackQueryProvider>
    <IntlProvider messages={messages} locale={lang} defaultLocale="en-US">
      {children}
    </IntlProvider>
  </TanStackQueryProvider>
);
