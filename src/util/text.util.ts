export function plural(singular: string, plural: string, count: number) {
  return `${count} ${count === 1 ? singular : plural}`;
}
