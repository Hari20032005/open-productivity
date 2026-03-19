import Anthropic from "@anthropic-ai/sdk";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface CoachContext {
  userName: string;
  addictionTypes: string[];
  currentStreaks: Array<{ label: string; days: number }>;
  todayMood?: number;
  todayUrgeIntensity?: number;
  recentJournalNote?: string;
  motivationReasons: string[];
}

const SYSTEM_PROMPT = `You are FreeFlow AI — a warm, non-judgmental recovery coach specializing in helping people overcome digital addiction (social media, porn, gaming, phone addiction) and build productive habits.

Your personality:
- Empathetic and supportive, never preachy or shame-based
- Evidence-based: you draw from CBT, mindfulness, and habit science
- Direct and practical: give specific actionable steps
- Celebratory: acknowledge every win, big or small
- Honest: tell the truth even when it's hard, but with compassion

Your approach:
- Use motivational interviewing techniques
- Help users identify triggers and coping strategies
- Suggest healthy replacement behaviors (exercise, creativity, social connection)
- Normalize struggle — relapses are part of recovery
- Keep responses concise (2-4 paragraphs max) unless asked for more

When a user reports urges, use the HALT framework (Hungry? Angry? Lonely? Tired?) and suggest immediate 5-minute interventions.

NEVER: lecture, shame, use religious framing (unless user initiates), suggest professional help dismissively, or promise unrealistic outcomes.`;

const client = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? "",
  dangerouslyAllowBrowser: true,
});

export async function sendCoachMessage(
  messages: ChatMessage[],
  context: CoachContext
): Promise<string> {
  const contextBlock = `
User context:
- Name: ${context.userName}
- Struggling with: ${context.addictionTypes.join(", ")}
- Current streaks: ${context.currentStreaks.map((s) => `${s.label}: ${s.days} days`).join(", ")}
- Today's mood (1-5): ${context.todayMood ?? "not logged"}
- Urge intensity today (1-5): ${context.todayUrgeIntensity ?? "not logged"}
- Recent journal: "${context.recentJournalNote ?? "none"}"
- Motivation reasons: ${context.motivationReasons.join("; ")}
`;

  const anthropicMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Inject context into first message if it's a fresh conversation
  if (anthropicMessages.length === 1) {
    anthropicMessages[0] = {
      role: "user",
      content: `${contextBlock}\n\nUser message: ${messages[0].content}`,
    };
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: anthropicMessages,
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export async function getDailyCheckIn(context: CoachContext): Promise<string> {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const prompt = `It's ${timeOfDay} and ${context.userName} is opening FreeFlow for a daily check-in.
${context.currentStreaks.map((s) => `${s.label} streak: ${s.days} days`).join(", ")}.
Today's mood: ${context.todayMood ?? "not yet logged"}.

Give a brief, personalized ${timeOfDay} check-in message (2-3 sentences).
Acknowledge their current progress, give one specific tip for today, and ask how they're feeling.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "How are you feeling today?";
}

export async function getUrgeResponse(
  context: CoachContext,
  urgeIntensity: number
): Promise<string> {
  const prompt = `${context.userName} is experiencing a ${urgeIntensity}/5 intensity urge right now.
They're trying to quit: ${context.addictionTypes.join(", ")}.
Their streak is: ${context.currentStreaks.map((s) => `${s.days} days`).join(", ")}.

Give them an immediate urge-surfing intervention. Be specific, actionable, and supportive.
Include: 1) Acknowledgment, 2) A 5-minute immediate action they can take right now, 3) One sentence of encouragement.
Keep it under 150 words.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "Take 5 deep breaths. You can do this.";
}
