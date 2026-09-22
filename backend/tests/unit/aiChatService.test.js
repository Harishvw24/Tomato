import { beforeEach, describe, expect, it, vi } from "vitest";
import { interpretMessage } from "../../services/aiChatService.js";

describe("aiChatService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "test-model";
    process.env.OPENAI_BASE_URL = "https://ai.example.com/v1";
  });

  it("returns null when AI is not configured", async () => {
    delete process.env.OPENAI_API_KEY;

    await expect(interpretMessage("show pizza", [])).resolves.toBeNull();
  });

  it("parses an AI response and keeps only real menu IDs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              intent: "SEARCH_FOOD",
              reply: "Here are two pizzas.",
              foodIds: ["food-1", "not-in-menu", "food-2"]
            })
          }
        }]
      })
    }));

    const result = await interpretMessage("I want pizza", [
      { _id: "food-1", name: "Pizza", price: 300 },
      { _id: "food-2", name: "Spicy Pizza", price: 400 }
    ]);

    expect(result).toEqual({
      intent: "SEARCH_FOOD",
      reply: "Here are two pizzas.",
      foodIds: ["food-1", "food-2"]
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://ai.example.com/v1/chat/completions",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("rejects provider errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    await expect(interpretMessage("show food", [])).rejects.toThrow("AI provider returned 429");
  });
});