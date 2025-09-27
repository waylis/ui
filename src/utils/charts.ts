export function getYAxisDomain(
  data: Record<string, any>[],
  series: { name: string }[],
  paddingPercent: number = 5,
): [number, number] {
  const values: number[] = [];

  for (const row of data) {
    for (const s of series) {
      const val = row[s.name];
      if (typeof val === "number" && !Number.isNaN(val)) {
        values.push(val);
      }
    }
  }

  if (values.length === 0) return [0, 0];

  let min = Math.min(...values);
  let max = Math.max(...values);

  const range = max - min;
  const padding = range * (paddingPercent / 100);

  if (range === 0) {
    return [min - 1, max + 1];
  }

  return [Math.floor(min - padding), Math.ceil(max + padding)];
}
