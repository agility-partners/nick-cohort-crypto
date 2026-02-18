import { Suspense } from "react";

import HomeContent from "@/domains/crypto/components/home-content";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense>
        <HomeContent />
      </Suspense>
    </main>
  );
}
