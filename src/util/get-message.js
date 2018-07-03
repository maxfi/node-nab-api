import isPlainObject from 'is-plain-object'

const convert = x => {
  if (isPlainObject(x)) {
    return Object.entries(x).reduce((acc, value) => {
      const [k, v] = value
      acc[k] = convert(v)
      return acc
    }, {})
  }

  return { _text: x }
}

export default x => {
  if (!isPlainObject(x)) throw new Error('Requires a plain object')
  return convert(x)
}
