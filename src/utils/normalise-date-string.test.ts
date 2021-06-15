import { normaliseDateString } from './normalise-date-string';

test('normaliseDateString', () => {
  expect(normaliseDateString('20172211193559912000+660')).toBe(
    '2017-11-22T08:35:59.912Z'
  );
});
