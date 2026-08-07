import { describe, expect, test } from "bun:test"

import { CHARACTERS, getCharacter } from "./model"
import { getPlayerCharacterId, ProcessedDiaSnapshotSchema } from "./snapshot-schema"
import { getAvailablePeriods, getLatestPeriod, getSnapshot } from "./snapshots.server"

describe("processed ranked snapshots", () => {
  test("discovers the available reporting periods", async () => {
    const periods = await getAvailablePeriods()

    expect(periods[0]).toBe("202306")
    expect(periods.at(-1)).toBe("202607")
    expect(periods.length).toBe(38)
    expect(await getLatestPeriod()).toBe("202607")
  })

  test("validates and caches a complete snapshot", async () => {
    const first = await getSnapshot("202607")
    const second = await getSnapshot("202607")
    const players = first.c["8"]?.p ?? []
    const playerIds = players.map((player) => getPlayerCharacterId(player))
    const catalogIds = new Set<string>(CHARACTERS.map((character) => character.id))
    const unknownIds = playerIds.filter((characterId) => !catalogIds.has(characterId))

    expect(first).toBe(second)
    expect(first.c["1"]?.m.length).toBe(first.c["1"]?.p.length)
    expect(first.c["1"]?.m[0]?.length).toBe(first.c["1"]?.p.length)
    expect(playerIds).toContain("ingrid")
    expect(unknownIds).toEqual([])
    expect(playerIds.every((characterId) => getCharacter(characterId) !== undefined)).toBe(true)
  })

  test("rejects malformed tuples, matrix values, and dimensions", () => {
    const malformedTuple = {
      c: {
        "1": {
          p: [["ryu", "X"]],
          m: [[1.1]],
        },
      },
      ci: {
        "1": {
          p: [["ryu", "C"]],
          m: [[0.5]],
        },
      },
    }
    const malformedMatrix = {
      c: {
        "1": {
          p: ["ryu", "ken"],
          m: [[0.5]],
        },
      },
      ci: {
        "1": {
          p: [
            ["ryu", "C"],
            ["ken", "M"],
          ],
          m: [
            [0.5, 0.5],
            [0.5, 0.5],
          ],
        },
      },
    }

    expect(ProcessedDiaSnapshotSchema.safeParse(malformedTuple).success).toBe(false)
    expect(ProcessedDiaSnapshotSchema.safeParse(malformedMatrix).success).toBe(false)
  })
})
