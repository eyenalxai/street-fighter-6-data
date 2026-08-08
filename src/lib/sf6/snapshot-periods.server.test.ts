import { expect, test } from "bun:test"

import type { SnapshotPeriodCatalog } from "./snapshot-periods.server"

import { buildSnapshotPeriodAvailability } from "./snapshot-periods.server"

test("caps advertised periods at the latest period shared by every family", () => {
  const catalog: SnapshotPeriodCatalog = {
    dia: ["202306", "202502", "202606", "202607"],
    dia_master: ["202502", "202606", "202607"],
    usagerate: ["202306", "202502", "202606"],
    usagerate_master: ["202502", "202606"],
  }

  const availability = buildSnapshotPeriodAvailability(catalog)

  expect(availability.latestCompletePeriod).toBe("202606")
  expect(availability.regularPeriods).toEqual(["202306", "202502", "202606"])
  expect(availability.subdivisionPeriods).toEqual(["202502", "202606"])
})
