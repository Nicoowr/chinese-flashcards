"use client";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "react-query";
import { FlashcardsContainer } from "../components/FlashcardsContainer";
const queryClient = new QueryClient();

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <QueryClientProvider client={queryClient}>
        <Theme>
          <FlashcardsContainer />
        </Theme>
      </QueryClientProvider>
    </main>
  );
}
