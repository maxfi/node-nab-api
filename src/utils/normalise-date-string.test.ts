import { normaliseDateString } from './normalise-date-string';

test.only('normaliseDateString', () => {
  expect(normaliseDateString('20172211193559912000+660')).toEqual(
    '2017-11-22T08:35:59.912Z'
  );

  expect(normaliseDateString('20140710015921142000+600')).toEqual(
    '2014-10-06T15:59:21.142Z'
  );
});
