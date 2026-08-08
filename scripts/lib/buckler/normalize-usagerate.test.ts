import { expect, test } from "bun:test"

import { normalizeUsageRate } from "./normalize-usagerate"

test("normalizes regular and Master usage rows into compact tuples", () => {
  const result = normalizeUsageRate({
    usagerateData: [
      {
        operation_type: 1,
        val: [
          {
            league_rank: 8,
            val: [
              { character_tool_name: "ryu", play_rate: 2.5, count: 1, previous_rate: 0 },
              { character_tool_name: "ken", play_rate: 3.5, count: 2, previous_rate: 0 },
              { character_tool_name: "guile", play_rate: 4.5, count: 1, previous_rate: 1.2 },
            ],
          },
        ],
      },
      {
        val: [
          {
            league_rank: 36,
            val: [{ character_tool_name: "ryu", play_rate: 5.5, count: 1, previous_rate: 0 }],
          },
        ],
      },
    ],
  })

  expect(result).toEqual([
    {
      ot: 1,
      lr: 8,
      c: [
        ["ryu", 2.5],
        ["ken", 3.5, 0, 2],
        ["guile", 4.5, 1.2],
      ],
    },
    {
      ot: 0,
      lr: 36,
      c: [["ryu", 5.5]],
    },
  ])
})
