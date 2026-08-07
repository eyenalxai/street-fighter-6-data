import { createRouterClient } from "@orpc/server"
import { describe, expect, test } from "bun:test"

import { router } from "./router"

describe("oRPC ranked analytics router", () => {
  test("serves validated metadata and a leaderboard", async () => {
    const client = createRouterClient(router)
    const meta = await client.meta()
    const leaderboard = await client.leaderboard({
      period: "202607",
      league: "8",
      controls: "combined",
    })

    expect(meta.latestPeriod).toBe("202607")
    expect(meta.periods).toContain("202306")
    expect(meta.characters.length).toBeGreaterThan(20)
    expect(meta.controls).toHaveLength(5)
    expect(leaderboard.rows.length).toBeGreaterThan(20)
  })

  test("rejects malformed procedure input", () => {
    const client = createRouterClient(router)

    expect(async () =>
      client.leaderboard({
        period: "not-a-reporting-period",
        league: "8",
        controls: "combined",
      }),
    ).toThrow()
  })
})
