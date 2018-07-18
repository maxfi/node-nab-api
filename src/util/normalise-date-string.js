import moment from 'moment'

const pad = s => (s.length === 1 ? '0' + s : s)

export const normaliseDateString = s => {
  const [d, o] = s.split('000+')
  const offsetMins = parseInt(o, 10)
  const hours = pad(Math.floor(offsetMins / 60).toString())
  const mins = pad((offsetMins % 60).toString())
  const fixed = `${d}+${hours}:${mins}`
  return moment(fixed, 'YYYYDDMMHHmmssSSSZ').toISOString()
}
