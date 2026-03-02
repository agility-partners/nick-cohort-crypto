import { createChatResponse } from "@/domains/assistant/utils/create-chat-response";

export async function POST(request: Request): Promise<Response> {
  return createChatResponse(request);
}