import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../services/foodService.js", () => ({
  getAllFoods: vi.fn()
}));

vi.mock("../../services/aiChatService.js", () => ({
  interpretMessage: vi.fn().mockResolvedValue(null)
}));

vi.mock("../../models/orderModel.js", () => ({
  default: {
    findOne: vi.fn()
  }
}));

import orderModel from "../../models/orderModel.js";
import { getAllFoods } from "../../services/foodService.js";
import { interpretMessage } from "../../services/aiChatService.js";
import { chat } from "../../controllers/chatController.js";

const createResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis()
});

describe("chatController", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    interpretMessage.mockResolvedValue(null);
  });

  it("rejects an empty message", async () => {
    const response = createResponse();

    await chat({ body: {} }, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ success: false, message: "Message is required" });
  });

  it("searches food by terms and maximum price", async () => {
    const response = createResponse();
    getAllFoods.mockResolvedValue([
      { _id: "1", name: "Chicken Pizza", description: "Spicy", category: "Pizza", price: 450 },
      { _id: "2", name: "Chicken Burger", description: "Grilled", category: "Burger", price: 250 },
      { _id: "3", name: "Chicken Feast", description: "Large", category: "Meals", price: 650 }
    ]);

    await chat({ body: { message: "show chicken under 500" } }, response);

    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      intent: "SEARCH_FOOD",
      foods: expect.arrayContaining([
        expect.objectContaining({ _id: "1" }),
        expect.objectContaining({ _id: "2" })
      ])
    }));
    expect(response.json.mock.calls[0][0].foods).toHaveLength(2);
  });

  it("requires login for order tracking", async () => {
    const response = createResponse();

    await chat({ body: { message: "track my order" } }, response);

    expect(response.json).toHaveBeenCalledWith({
      success: true,
      intent: "TRACK_ORDER",
      reply: "Please sign in to view your order status.",
      requiresLogin: true
    });
  });

  it("returns the authenticated user's latest order", async () => {
    const response = createResponse();
    const lean = vi.fn().mockResolvedValue({
      _id: "order-1",
      status: "out for delivery",
      amount: 500,
      items: [{ name: "Pizza", quantity: 2 }]
    });
    orderModel.findOne.mockReturnValue({
      sort: vi.fn().mockReturnValue({ lean })
    });

    await chat({ body: { message: "where is my order" }, user: { _id: "user-1" } }, response);

    expect(orderModel.findOne).toHaveBeenCalledWith({ userId: "user-1" });
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      intent: "TRACK_ORDER",
      order: expect.objectContaining({ id: "order-1", status: "out for delivery" })
    }));
  });
});