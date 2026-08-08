import { expect, test } from "bun:test"

import {
  getUsageCount,
  getUsagePlayRate,
  getUsagePreviousRate,
  ProcessedUsageSnapshotSchema,
} from "./snapshot-schema"

const snapshot = [
  {
    ot: 0,
    lr: 8,
    c: [
      ["ryu", 12.5, 11.2, 1200],
      ["ken", 10.4],
    ],
  },
] as const

test("usage tuples decode optional previous rate and count fields", () => {
  const parsed = ProcessedUsageSnapshotSchema.parse(snapshot)
  const bucket = parsed.at(0)
  const detailed = bucket?.c.at(0)
  const compact = bucket?.c.at(1)
  if (bucket === undefined || detailed === undefined || compact === undefined) {
    throw new Error("Test fixture did not parse")
  }
  expect(getUsagePlayRate(detailed)).toBe(12.5)
  expect(getUsagePreviousRate(detailed)).toBe(11.2)
  expect(getUsageCount(detailed)).toBe(1200)
  expect(getUsagePreviousRate(compact)).toBe(0)
  expect(getUsageCount(compact)).toBe(1)
})

test("usage snapshots reject duplicate rank/control buckets", () => {
  expect(
    ProcessedUsageSnapshotSchema.safeParse([
      { ot: 0, lr: 8, c: [["ryu", 12.5]] },
      { ot: 0, lr: 8, c: [["ken", 10.4]] },
    ]).success,
  ).toBe(false)
  expect(
    ProcessedUsageSnapshotSchema.safeParse([{ ot: 0, lr: 39, c: [["ryu", 12.5]] }]).success,
  ).toBe(false)
  expect(
    ProcessedUsageSnapshotSchema.safeParse([
      {
        ot: 0,
        lr: 8,
        c: [
          ["ryu", 12.5],
          ["ryu", 4.2],
        ],
      },
    ]).success,
  ).toBe(false)
  expect(
    ProcessedUsageSnapshotSchema.safeParse([
      {
        ot: 0,
        lr: 8,
        c: [
          ["ryu", 12.5],
          ["ken", 4.2],
        ],
      },
    ]).success,
  ).toBe(true)
})
