import { beforeEach, describe, expect, it, vi } from "vitest";

const { redisClient } = vi.hoisted(() => ({
  redisClient: {
    isOpen: true,
    on: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    scanIterator: vi.fn()
  }
}));

vi.mock("redis", () => ({
  createClient: () => redisClient
}));

import { deleteCache, deleteCachePattern, getCache, setCache } from "../../services/cacheService.js";

describe("cacheService", () => {
  beforeEach(() => {
    redisClient.isOpen = true;
    redisClient.get.mockReset();
    redisClient.set.mockReset();
    redisClient.del.mockReset();
    redisClient.scanIterator.mockReset();
  });

  it("parses cached JSON values", async () => {
    redisClient.get.mockResolvedValue('{"name":"Pizza"}');

    await expect(getCache("food:list")).resolves.toEqual({ name: "Pizza" });
    expect(redisClient.get).toHaveBeenCalledWith("food:list");
  });

  it("returns null when Redis is unavailable", async () => {
    redisClient.isOpen = false;

    await expect(getCache("food:list")).resolves.toBeNull();
    expect(redisClient.get).not.toHaveBeenCalled();
  });

  it("writes values with an expiration", async () => {
    await setCache("food:list", [{ name: "Pizza" }], 120);

    expect(redisClient.set).toHaveBeenCalledWith(
      "food:list",
      '[{"name":"Pizza"}]',
      { EX: 120 }
    );
  });

  it("deletes a cache key", async () => {
    await deleteCache("food:list");

    expect(redisClient.del).toHaveBeenCalledWith("food:list");
  });

  it("deletes all keys matching a pattern", async () => {
    redisClient.scanIterator.mockReturnValue((async function* () {
      yield "orders:user:one";
      yield "orders:admin:list";
    })());

    await deleteCachePattern("orders:*");

    expect(redisClient.scanIterator).toHaveBeenCalledWith({ MATCH: "orders:*" });
    expect(redisClient.del).toHaveBeenNthCalledWith(1, "orders:user:one");
    expect(redisClient.del).toHaveBeenNthCalledWith(2, "orders:admin:list");
  });

  it("handles batched and empty scan results", async () => {
    redisClient.scanIterator.mockReturnValue((async function* () {
      yield ["orders:user:one", "orders:admin:list"];
      yield [];
    })());

    await deleteCachePattern("orders:*");

    expect(redisClient.del).toHaveBeenCalledTimes(2);
    expect(redisClient.del).toHaveBeenNthCalledWith(1, "orders:user:one");
    expect(redisClient.del).toHaveBeenNthCalledWith(2, "orders:admin:list");
  });

  it("swallows Redis read and write errors", async () => {
    redisClient.get.mockRejectedValue(new Error("Redis unavailable"));
    redisClient.set.mockRejectedValue(new Error("Redis unavailable"));

    await expect(getCache("food:list")).resolves.toBeNull();
    await expect(setCache("food:list", [])).resolves.toBeUndefined();
  });
});