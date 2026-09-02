import { describe, expect, it } from "vitest";
import { sampleCanvasCreationFlowPosition } from "whiteboat-core/water-field";

describe("shared Whiteboat water-field wrapping", () => {
  it.each([
    { name: "DSH", topInset: 0, time: 3 },
    { name: "Obsidian", topInset: 12, time: 8.7 },
  ])("keeps $name vertical flow rows evenly spaced across wrapping", ({
    topInset,
    time,
  }) => {
    const height = 437;
    const spacing = 24;
    const rowCount = Math.ceil((height - topInset) / spacing) + 1;
    const positions = Array.from({ length: rowCount }, (_, row) =>
      sampleCanvasCreationFlowPosition({
        baseX: 0,
        baseY: topInset + row * spacing,
        column: 0,
        row,
        width: 971,
        height,
        topInset,
        spacing,
        time,
      }).y,
    ).sort((first, second) => first - second);
    const minimumGap = Math.min(
      ...positions.slice(1).map((position, index) =>
        position - positions[index]
      ),
    );

    expect(minimumGap).toBeGreaterThan(spacing * 0.7);
  });
});
