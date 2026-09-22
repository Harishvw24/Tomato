import orderModel from "../models/orderModel.js";
import { getAllFoods } from "../services/foodService.js";
import { interpretMessage } from "../services/aiChatService.js";

const STOP_WORDS = new Set([
  "a", "an", "and", "at", "for", "food", "find", "get", "i", "me",
  "my", "of", "on", "please", "show", "some", "the", "to", "under",
  "want", "with"
]);

const normalize = (value = "") => value.toLowerCase().replace(/[^a-z0-9. ]/g, " ");

const findFood = (message, foods) => {
  const normalizedMessage = normalize(message);
  const priceMatch = normalizedMessage.match(/(?:under|less than|below)\s*(\d+(?:\.\d+)?)/);
  const maxPrice = priceMatch ? Number(priceMatch[1]) : null;
  const terms = normalizedMessage
    .split(/\s+/)
    .filter((term) => term && !STOP_WORDS.has(term) && !/^\d+(?:\.\d+)?$/.test(term));

  const matches = foods.filter((food) => {
    const searchable = normalize(`${food.name} ${food.description} ${food.category} ${(food.dietaryTags || []).join(" ")}`);
    const matchesTerms = terms.length === 0 || terms.some((term) => searchable.includes(term));
    return matchesTerms && (maxPrice === null || Number(food.price) <= maxPrice);
  });

  return matches.slice(0, 8);
};

const chat = async (req, res) => {
  const message = String(req.body?.message || "").trim();

  if (!message) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }

  try {
    const foods = await getAllFoods();
    let aiResult = null;

    try {
      aiResult = await interpretMessage(message, foods);
    } catch (error) {
      console.warn("AI chatbot unavailable, using local matching:", error.message);
    }

    const normalizedMessage = normalize(message);
    const asksAboutOrder = aiResult?.intent === "TRACK_ORDER" || /order|deliver|track|status/.test(normalizedMessage);

    if (asksAboutOrder) {
      if (!req.user) {
        return res.json({
          success: true,
          intent: "TRACK_ORDER",
          reply: "Please sign in to view your order status.",
          requiresLogin: true
        });
      }

      const latestOrder = await orderModel.findOne({ userId: req.user._id }).sort({ date: -1 }).lean();

      if (!latestOrder) {
        return res.json({ success: true, intent: "TRACK_ORDER", reply: "You do not have any orders yet." });
      }

      const itemSummary = latestOrder.items.map((item) => `${item.name} x ${item.quantity}`).join(", ");
      return res.json({
        success: true,
        intent: "TRACK_ORDER",
        reply: `Your latest order is ${latestOrder.status.toLowerCase()}. It contains ${itemSummary}.`,
        order: {
          id: latestOrder._id,
          status: latestOrder.status,
          amount: latestOrder.amount,
          items: latestOrder.items
        }
      });
    }

    const matches = aiResult
      ? foods.filter((food) => aiResult.foodIds.includes(String(food._id)))
      : findFood(message, foods);

    return res.json({
      success: true,
      intent: "SEARCH_FOOD",
      reply: aiResult?.reply || (matches.length
        ? `I found ${matches.length} option${matches.length === 1 ? "" : "s"} for you.`
        : "I could not find an exact match. Try a category, ingredient, or price limit."),
      foods: matches
    });
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ success: false, message: "Unable to process your request" });
  }
};

export { chat };