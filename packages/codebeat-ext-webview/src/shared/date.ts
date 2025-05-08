export function formatDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const year = parts.find(p => p.type === 'year')!.value
  const month = parts.find(p => p.type === 'month')!.value
  const day = parts.find(p => p.type === 'day')!.value
  const hour = parts.find(p => p.type === 'hour')!.value
  const minute = parts.find(p => p.type === 'minute')!.value

  return `${year}/${month}/${day} ${hour}:${minute}`
}
