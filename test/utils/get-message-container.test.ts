import { getMessageContainer } from '../../src/utils/get-message-container';
import { toXml } from '../../src/utils/send-request';
import { isoDateStringRegex } from '../helpers/iso-date-string-regex';

const payload = {
  messageId: '8af793f9af34bea0ecd7eff711c9d3',
  credentials: {
    merchantId: 'XYZ00',
    password: 'abcd1234',
  },
  requestType: 'addToken',
  dataElementName: 'Token',
  payload: {
    cardNumber: '4444333322221111',
    expiryDate: '11/15',
    tokenType: '1',
  },
  options: {},
};

const messageTimeStampPropertyMatcher = {
  NABTransactMessage: {
    MessageInfo: {
      messageTimestamp: { _text: expect.stringMatching(isoDateStringRegex) },
    },
  },
};

const removeTimestamp = (x: string) =>
  x.replace(/<messageTimestamp>.*<\/messageTimestamp>/, '');

test('getMessageContainer', () => {
  const result = getMessageContainer(payload);
  expect(result).toMatchSnapshot(messageTimeStampPropertyMatcher);
});

test('getMessageContainer should create the correct object to be parsed to XML', async () => {
  const xml = removeTimestamp(toXml(getMessageContainer(payload)));
  expect(xml).toMatchSnapshot();
});
