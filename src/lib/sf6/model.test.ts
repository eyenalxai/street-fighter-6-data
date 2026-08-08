import { expect, test } from "bun:test"

import { NonEmptyUniqueCharacterIdsSchema, UniqueCharacterIdsSchema } from "./model"
import { MatchupSearchSchema } from "./search"

test("counterpick opponent IDs are unique", () => {
  expect(UniqueCharacterIdsSchema.safeParse(["ryu", "ken"]).success).toBe(true)
  expect(UniqueCharacterIdsSchema.safeParse(["ryu", "ryu"]).success).toBe(false)
  expect(MatchupSearchSchema.parse({ view: "counterpicks" }).opponents).toEqual([])
  expect(
    MatchupSearchSchema.safeParse({ view: "counterpicks", opponents: ["ryu", "ryu"] }).success,
  ).toBe(false)
  expect(NonEmptyUniqueCharacterIdsSchema.safeParse([]).success).toBe(false)
})
