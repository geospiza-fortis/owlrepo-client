import { test, expect } from "@playwright/test";

test.describe("API proxy error handling", () => {
  test("query endpoint returns error JSON for nonexistent prefix", async ({
    request,
  }) => {
    const res = await request.get(
      "/api/v2/query/nonexistent_prefix_that_does_not_exist",
    );
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("data endpoint returns error JSON for nonexistent task", async ({
    request,
  }) => {
    const res = await request.get(
      "/api/v2/data/nonexistent-task-id/slim.json",
    );
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });
});
