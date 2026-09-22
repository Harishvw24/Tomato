import foodModel from "../models/foodModel.js";
import { getCache, setCache, deleteCache } from "./cacheService.js";

const FOOD_LIST_CACHE_KEY = "food:list";

export const getAllFoods = async () => {
  const cachedFoods = await getCache(FOOD_LIST_CACHE_KEY);

  if (cachedFoods) {
    return cachedFoods;
  }

  const foods = await foodModel.find({}).lean();

  await setCache(FOOD_LIST_CACHE_KEY, foods, 300);

  return foods;
};

export const createFood = async (foodData) => {
  const food = await foodModel.create(foodData);

  await deleteCache(FOOD_LIST_CACHE_KEY);

  return food;
};

export const deleteFood = async (id) => {
  const food = await foodModel.findByIdAndDelete(id);

  await deleteCache(FOOD_LIST_CACHE_KEY);

  return food;
};