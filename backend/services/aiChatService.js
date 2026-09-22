const getAiConfig = () => ({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
});

const buildMenu = (foods) => foods.map((food) => ({
  id: String(food._id),
  name: food.name,
  description: food.description,
  category: food.category,
  price: food.price,
  dietaryTags: food.dietaryTags || []
}));

const interpretMessage = async (message, foods) => {
  const { apiKey, model, baseUrl } = getAiConfig();

  if (!apiKey) {
    return null;
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You are a helpful food delivery assistant.",
            "Return valid JSON only with this shape: {intent, reply, foodIds}.",
            "intent must be SEARCH_FOOD or TRACK_ORDER.",
            "For SEARCH_FOOD, foodIds may only contain IDs from the supplied menu.",
            "For TRACK_ORDER, foodIds must be an empty array.",
            "Never claim an order status or menu item that is not supplied by the application.",
            `Menu: ${JSON.stringify(buildMenu(foods))}`
          ].join("\n")
        },
        { role: "user", content: message }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`AI provider returned ${response.status}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI provider returned an empty response");
  }

  const result = JSON.parse(content);
  const validIds = new Set(foods.map((food) => String(food._id)));

  return {
    intent: result.intent === "TRACK_ORDER" ? "TRACK_ORDER" : "SEARCH_FOOD",
    reply: typeof result.reply === "string" ? result.reply : "Here are some options for you.",
    foodIds: Array.isArray(result.foodIds)
      ? result.foodIds.filter((id) => validIds.has(String(id))).slice(0, 8)
      : []
  };
};

export { interpretMessage };