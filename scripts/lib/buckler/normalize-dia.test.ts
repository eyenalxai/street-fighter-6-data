import { describe, expect, test } from "bun:test"

import { normalizeDia } from "./normalize-dia.ts"

describe("normalizeDia", () => {
  test("converts Buckler's 0-to-10 values into 0-to-1 fractions", () => {
    const raw = {
      diaData: {
        c: {
          d_sort: {
            "1": {
              opponent_header: [
                { id: 1, tool_name: "ryu" },
                { id: 2, tool_name: "ken" },
              ],
              records: [
                {
                  tool_name: "ryu",
                  values: [
                    { _oid: 1, val: "-" },
                    { _oid: 2, val: "5.405" },
                  ],
                },
                {
                  tool_name: "ken",
                  values: [
                    { _oid: 1, val: "4.595" },
                    { _oid: 2, val: "-.---" },
                  ],
                },
              ],
            },
          },
        },
      },
    }

    expect(normalizeDia(raw)).toEqual({
      c: {
        "1": {
          p: ["ryu", "ken"],
          m: [
            [null, 0.5405],
            [0.4595, null],
          ],
        },
      },
    })
  })

  test("keeps missing headers and empty values as null", () => {
    const raw = {
      diaData: {
        c: {
          d_sort: {
            "1": {
              opponent_header: [{ id: 1, tool_name: "ryu" }],
              records: [
                {
                  tool_name: "ken",
                  values: [
                    { _oid: 1, val: "5.000" },
                    { _oid: 2, val: "6.000" },
                    { _oid: 1, val: "" },
                  ],
                },
              ],
            },
          },
        },
      },
    }

    expect(normalizeDia(raw).c?.["1"]?.m).toEqual([[0.5, null, null]])
  })
})
