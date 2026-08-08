import { expect, test } from "bun:test"

import { NonEmptyUniqueCharacterIdsSchema, UniqueCharacterIdsSchema } from "./model"
import { CounterpickSearchSchema } from "./search"

test("counterpick opponent IDs are unique", () => {
  expect(UniqueCharacterIdsSchema.safeParse(["ryu", "ken"]).success).toBe(true)
  expect(UniqueCharacterIdsSchema.safeParse(["ryu", "ryu"]).success).toBe(false)
  expect(CounterpickSearchSchema.parse({}).opponents).toEqual([])
  expect(CounterpickSearchSchema.safeParse({ opponents: ["ryu", "ryu"] }).success).toBe(false)
  expect(NonEmptyUniqueCharacterIdsSchema.safeParse([]).success).toBe(false)
})
