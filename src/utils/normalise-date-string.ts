import parse from 'date-fns/parse';

const pad = (str: string) => (str.length === 1 ? '0' + str : str);

export const normaliseDateString = (str: string) => {
  const [d, o] = str.split('000+');
  const offsetMins = parseInt(o, 10);
  const hours = pad(Math.floor(offsetMins / 60).toString());
  const mins = pad((offsetMins % 60).toString());
  const fixed = `${d}+${hours}:${mins}`;
  return parse(fixed, 'yyyyddMMHHmmssSSSXXX', new Date()).toISOString();
};
