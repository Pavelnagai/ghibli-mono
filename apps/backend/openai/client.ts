import { config } from 'db/config';
import OpenAI from 'openai';

export const openaiClient = new OpenAI({
  apiKey: config.api.openAiKey,
});
