import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../services/cacheService.js", () => ({
  getCache: vi.fn(),
  setCache: vi.fn(),
  deleteCache: vi.fn()
}));

import foodModel from "../../models/foodModel.js";
import { deleteCache, getCache, setCache } from "../../services/cacheService.js";
import { createFood, deleteFood, getAllFoods } from "../../services/foodService.js";

describe("foodService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(foodModel, "find");
    getCache.mockReset();
    setCache.mockReset();
    deleteCache.mockReset();
  });

  it("returns cached foods without querying MongoDB", async () => {
    const foods = [{ name: "Pizza", price: 250 }];
    getCache.mockResolvedValue(foods);

    const result = await getAllFoods();

    expect(result).toEqual(foods);
    expect(foodModel.find).not.toHaveBeenCalled();
  });

  it("loads and caches foods when the cache is empty", async () => {
    const foods = [
      {
        name: "Pizza",
        category: "Italian",
        price: 250
      }
    ];

    getCache.mockResolvedValue(null);
    foodModel.find.mockReturnValue({
      lean: vi.fn().mockResolvedValue(foods)
    });

    const result = await getAllFoods();

    expect(result).toEqual(foods);
    expect(foodModel.find).toHaveBeenCalledWith({});
    expect(setCache).toHaveBeenCalledWith("food:list", foods, 300);
  });

  it("invalidates the food cache after creating food", async () => {
    const food = { name: "Burger" };
    vi.spyOn(foodModel, "create").mockResolvedValue(food);

    await expect(createFood(food)).resolves.toEqual(food);

    expect(deleteCache).toHaveBeenCalledWith("food:list");
  });

  it("invalidates the food cache after deleting food", async () => {
    const deletedFood = { _id: "food-id" };
    vi.spyOn(foodModel, "findByIdAndDelete").mockResolvedValue(deletedFood);

    await expect(deleteFood("food-id")).resolves.toEqual(deletedFood);

    expect(deleteCache).toHaveBeenCalledWith("food:list");
  });
});