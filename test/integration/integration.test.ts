import { NAB } from '../../src';
import { isoDateStringRegex } from '../helpers/iso-date-string-regex';

const nab = new NAB({
  merchantId: 'XYZ0010',
  password: 'abcd1234',
  testMode: true,
});

const messageTimeStampPropertyMatcher = {
  MessageInfo: {
    messageTimestamp: expect.stringMatching(isoDateStringRegex),
  },
};

/**
 * NOTE: From docs (XML_API_Guide_Tokenisation.pdf)
 * > One card number will always generate the same Token.
 * However, this doesn't appear to be case when a token is created,
 * then deleted, and created again.
 */

test('addToken', async () => {
  const result = await nab.addToken('123456789', {
    cardNumber: '4219448174236125',
    expiryDate: '01/26',
  });

  expect(result).toMatchSnapshot(messageTimeStampPropertyMatcher);
});

test('lookupToken', async () => {
  const {
    Data: { tokenValue },
  } = await nab.addToken('123456789', {
    cardNumber: '4549771486564913',
    expiryDate: '09/22',
  });

  const result = await nab.lookupToken('123456789', tokenValue);

  expect(result).toMatchSnapshot({
    ...messageTimeStampPropertyMatcher,
    Data: { tokenValue: expect.stringMatching(tokenValue) },
  });
});

test('deleteToken', async () => {
  const {
    Data: { tokenValue },
  } = await nab.addToken('123456789', {
    cardNumber: '4334899786622765',
    expiryDate: '08/27',
  });

  const deleteResult = await nab.deleteToken('123456789', tokenValue);
  expect(deleteResult).toMatchSnapshot(messageTimeStampPropertyMatcher);

  const lookupResult = await nab.lookupToken('123456789', tokenValue);
  expect(lookupResult).toMatchSnapshot(messageTimeStampPropertyMatcher);
});

test('triggerPayment - success', async () => {
  const result = await nab.triggerPayment('123456789', {
    crn: 'testTokenId180703',
    amount: '100',
    transactionReference: 'test transaction - node-nab-api',
  });

  expect(result).toMatchSnapshot({
    ...messageTimeStampPropertyMatcher,
    Data: {
      txnID: expect.stringMatching(/^\d+$/),
      settlementDate: expect.stringMatching(/^\d{8}$/),
    },
  });
});

test('triggerPayment - failure', async () => {
  const result = await nab.triggerPayment('123456789', {
    crn: 'testTokenId180703',
    amount: '105',
    transactionReference: 'test transaction - node-nab-api',
  });

  expect(result).toMatchSnapshot({
    ...messageTimeStampPropertyMatcher,
    Data: {
      txnID: expect.stringMatching(/^\d+$/),
      settlementDate: expect.stringMatching(/^\d{8}$/),
    },
  });
});
