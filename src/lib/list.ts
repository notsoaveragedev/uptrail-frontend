export function toggleItem<Value>(list: Value[], value: Value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}
