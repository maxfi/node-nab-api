import { isPlainObject } from 'is-plain-object';

const convert = (x: object) => {
  if (isPlainObject(x)) {
    return Object.entries(x).reduce((acc, value) => {
      const [k, v] = value;
      acc[k] = convert(v);
      return acc;
    }, {} as Record<string, unknown>);
  }

  return { _text: x };
};

export const getMessage = (x: object) => {
  if (!isPlainObject(x)) throw new Error('Requires a plain object');
  return convert(x);
};
