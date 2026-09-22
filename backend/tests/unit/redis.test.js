import { beforeEach, describe, expect, it, vi } from "vitest";

const { redisClient } = vi.hoisted(() => ({
  redisClient: {
    isOpen: false,
    on: vi.fn(),
    connect: vi.fn(),
    quit: vi.fn()
  }
}));

vi.mock("redis", () => ({
  createClient: () => redisClient
}));

import { connectRedis, disconnectRedis } from "../../config/redis.js";

describe("redis connection", () => {
  beforeEach(() => {
    process.env.REDIS_URL = "redis://localhost:6379";
    redisClient.isOpen = false;
    redisClient.connect.mockReset();
    redisClient.quit.mockReset();
  });

  it("does not reconnect an open client", async () => {
    redisClient.isOpen = true;

    await expect(connectRedis()).resolves.toBe(true);

    expect(redisClient.connect).not.toHaveBeenCalled();
  });

  it("connects successfully", async () => {
    redisClient.connect.mockResolvedValue(undefined);

    await expect(connectRedis()).resolves.toBe(true);

    expect(redisClient.connect).toHaveBeenCalledOnce();
  });

  it("continues without Redis when connection fails", async () => {
    redisClient.connect.mockRejectedValue(new Error("connection refused"));

    await expect(connectRedis()).resolves.toBe(false);
  });

  it("disconnects an open client", async () => {
    redisClient.isOpen = true;
    redisClient.quit.mockResolvedValue(undefined);

    await disconnectRedis();

    expect(redisClient.quit).toHaveBeenCalledOnce();
  });
});