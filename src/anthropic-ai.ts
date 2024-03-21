import Anthropic from "@anthropic-ai/sdk";

export const createAnthropicClient = (apiKey: string) =>
  new Anthropic({
    apiKey,
  });

export const DEFAULT_MODEL = "claude-3-opus-20240229"

export const completionStream = async (params: {
  apiKey: string;
  messageStreamParams:Anthropic.MessageStreamParams
}) => {
  const client = createAnthropicClient(params.apiKey);

  return client.messages.stream(
    params.messageStreamParams,
  );
};
