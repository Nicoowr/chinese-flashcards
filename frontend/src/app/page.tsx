"use client";
import { FlashcardsContainer } from "@/components/FlashcardsContainer";
import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <QueryClientProvider client={queryClient}>
        <FlashcardsContainer />
      </QueryClientProvider>
    </main>
  );
}
