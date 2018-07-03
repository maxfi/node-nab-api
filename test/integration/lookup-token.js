import test from 'ava'
import NAB from '../../src'
import isIsoDateString from '../helpers/is-iso-date-string'

test('NAB.lookupToken - token does not exist', async t => {
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
    cardNumber: '4549771486564913',
    expiryDate: '09/22',
    // CVV: '353'
    transactionReference: 'test transaction - node-nab-api',
  })

  const result = await nab.lookupToken('123456789', tokenValue)

  // Check variations
  t.true(isIsoDateString(result.MessageInfo.messageTimestamp))
  result.MessageInfo.messageTimestamp = '2017-10-20T00:00:00.000Z'

  const expected = {
    MessageInfo: {
      messageID: '123456789',
      messageTimestamp: '2017-10-20T00:00:00.000Z',
      apiVersion: 'xml-4.2',
    },
    RequestType: 'Payment',
    MerchantInfo: { merchantID: 'XYZ0010' },
    Status: { statusCode: '0', statusDescription: 'Normal' },
    Data: {
      responseCode: '00',
      responseText: 'Successful',
      successful: 'yes',
      tokenValue,
      CreditCardInfo: {
        pan: '454977XXXXXXX913',
        expiryDate: '09/22',
        cardType: '6',
        cardDescription: 'Visa',
      },
      amount: '100',
      transactionReference: 'test transaction - node-nab-api',
    },
  }

  t.deepEqual(result, expected)
})
