import Anthropic from "@anthropic-ai/sdk";

export const createAnthropicClient = (apiKey: string) =>
  new Anthropic({
    apiKey,
  });

export const completionStream = async (params: {
  apiKey: string;
  messages: Array<Anthropic.MessageParam>;
  model?: string | null;
}) => {
  const client = createAnthropicClient(params.apiKey);

  return client.messages.stream({
    messages: params.messages,
    model: params.model ?? "claude-3-opus-20240229",
    max_tokens: 1000,
  });
};
