import { isPlainObject } from 'is-plain-object';

const convert = (x: any) => {
  if (!isPlainObject(x)) return x;
  if (x._text) return x._text;
  return Object.entries(x).reduce((acc, value) => {
    const [k, v] = value;
    acc[k] = convert(v);
    return acc;
  }, {} as Record<string, string>);
};

export const getResponse = (x: object) => {
  if (!isPlainObject(x)) throw new Error('Requires a plain object');
  return convert(x);
};
