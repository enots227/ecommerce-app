"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
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
}
