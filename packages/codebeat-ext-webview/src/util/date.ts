export function formatHour(hours: number) {
  if (hours === 0)
    return '12a'
  if (hours === 12)
    return '12p'
  return `${hours % 12}${hours < 12 ? 'a' : 'p'}`
};

export function formatDayTime(date: Date) {
  const hour = formatHour(date.getHours())
  const [hourNum, ap] = [hour.slice(0, hour.length - 1), hour.slice(hour.length - 1)]
  return `${hourNum}:${date.getMinutes().toString().padStart(2, '0')}${ap}m`
}

export function formatAxisHour(date: Date | number) {
  const hours = typeof date === 'number' ? new Date(date).getHours() : date.getHours()
  return formatHour(hours)
}
