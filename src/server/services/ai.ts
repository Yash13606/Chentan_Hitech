import "server-only";

// Lazy import so the module doesn't break if ANTHROPIC_API_KEY is missing
async function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT = `You are an expert procurement advisor for Chetan Hi-Tech, an industrial equipment company specialising in:
- Commercial kitchen equipment (ovens, dishwashers, cold rooms, blast chillers)
- Laundry infrastructure (barrier washers, dryers, ironers, finishers)
- Warewashing systems
- Refrigeration and cold storage
- Food service and cafeteria equipment

You help clients in hospitality (hotels, resorts), healthcare (hospitals, labs), defence & marine (naval messes, ships), corporate (cafeterias, tech parks), and education sectors.

When a user describes their facility, respond with:
1. A brief analysis of their requirements (2-3 sentences)
2. A numbered list of recommended equipment categories with specific product types
3. A note about the next step (submitting an RFQ or booking a consultation)

Be specific, technical, and concise. Use industry terminology. Format your response clearly with line breaks.
Do NOT include prices or specific brand names. Focus on specifications and categories.`;

export async function generateEquipmentSuggestion(prompt: string): Promise<string> {
  const client = await getAnthropicClient();

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `My facility: ${prompt}

Please suggest the right equipment loadout.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}
