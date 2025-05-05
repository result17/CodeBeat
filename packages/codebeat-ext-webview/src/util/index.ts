export function formatHour(hours: number) {
  if (hours === 0)
    return '12a'
  if (hours === 12)
    return '12p'
  return `${hours % 12}${hours < 12 ? 'a' : 'p'}`
};
