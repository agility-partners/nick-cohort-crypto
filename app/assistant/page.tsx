import { Suspense } from "react";

import AssistantContent from "@/domains/assistant/components/assistant-content";

export default function AssistantPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense>
        <AssistantContent />
      </Suspense>
    </main>
  );
}