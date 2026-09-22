import { beforeEach, describe, expect, it, vi } from "vitest";

const { orderModel, userModel, cacheService } = vi.hoisted(() => ({
  orderModel: {
    find: vi.fn()
  },
  userModel: {},
  cacheService: {
    deleteCachePattern: vi.fn(),
    getCache: vi.fn(),
    setCache: vi.fn()
  }
}));

vi.mock("../../models/orderModel.js", () => ({ default: orderModel }));
vi.mock("../../models/userModel.js", () => ({ default: userModel }));
vi.mock("../../services/cacheService.js", () => cacheService);
vi.mock("stripe", () => ({ default: vi.fn() }));

import { listOrders, userOrders } from "../../controllers/orderController.js";

const createResponse = () => ({
  json: vi.fn()
});

describe("order controller caching", () => {
  beforeEach(() => {
    orderModel.find.mockReset();
    cacheService.getCache.mockReset();
    cacheService.setCache.mockReset();
  });

  it("returns customer orders from cache without querying MongoDB", async () => {
    const response = createResponse();
    const orders = [{ _id: "order-1" }];
    cacheService.getCache.mockResolvedValue(orders);

    await userOrders({ user: { _id: "user-1" } }, response);

    expect(response.json).toHaveBeenCalledWith({ success: true, data: orders });
    expect(orderModel.find).not.toHaveBeenCalled();
  });

  it("caches the admin order list after a database miss", async () => {
    const response = createResponse();
    const orders = [{ _id: "order-1" }];
    cacheService.getCache.mockResolvedValue(null);
    orderModel.find.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(orders)
      })
    });

    await listOrders({}, response);

    expect(orderModel.find).toHaveBeenCalledWith({});
    expect(cacheService.setCache).toHaveBeenCalledWith("orders:admin:list", orders, 30);
    expect(response.json).toHaveBeenCalledWith({ success: true, data: orders });
  });
});
