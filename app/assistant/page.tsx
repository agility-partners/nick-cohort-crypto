import { Suspense } from "react";

import AssistantContent from "@/domains/assistant/components/assistant-content";

export default function AssistantPage() {
  return (
    <main className="flex h-[calc(100vh-7rem)] flex-col px-4 sm:px-6 lg:px-8">
      <Suspense>
        <AssistantContent />
      </Suspense>
    </main>
  );
}