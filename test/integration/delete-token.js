import test from 'ava'
import NAB from '../../src'
import isIsoDateString from '../helpers/is-iso-date-string'

test('NAB.deleteToken - token does not exist', async t => {
  const nab = new NAB(
    {
      merchantId: 'XYZ0010',
      password: 'abcd1234',
    },
    {
      testMode: true,
    }
  )

  const {
    Data: { tokenValue },
  } = await nab.addToken('123456789', {
    cardNumber: '4334899786622765',
    expiryDate: '08/27',
    // CVV: '558'
    transactionReference: 'test transaction - node-nab-api',
  })

  const result = await nab.deleteToken('123456789', tokenValue)

  // Check variations
  // NOTE: Timestamp different from docs
  t.true(isIsoDateString(result.MessageInfo.messageTimestamp))
  result.MessageInfo.messageTimestamp = '2018-07-03T06:59:16.539Z'

  const expected = {
    MessageInfo: {
      messageID: '123456789',
      messageTimestamp: '2018-07-03T06:59:16.539Z',
      apiVersion: 'xml-4.2',
    },
    RequestType: 'Payment',
    MerchantInfo: { merchantID: 'XYZ0010' },
    Status: { statusCode: '0', statusDescription: 'Normal' },
    Data: {
      responseCode: '00',
      responseText: 'Successful',
      successful: 'yes',
      amount: '0',
      tokenValue,
      CreditCardInfo: {
        pan: {},
        expiryDate: {},
        cardType: '0',
        cardDescription: {},
      },
      transactionReference: {},
    },
  }

  t.deepEqual(result, expected)
})
