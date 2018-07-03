import test from 'ava'
import NAB from '../../src'
import isIsoDateString from '../helpers/is-iso-date-string'

/**
 * NOTE: From docs (XML_API_Guide_Tokenisation.pdf)
 * > One card number will always generate the same Token.
 * However, this doesn't appear to be case when a token is created,
 * then deleted, and created again.
 */

test('addToken - success', async t => {
  const nab = new NAB(
    {
      merchantId: 'XYZ0010',
      password: 'abcd1234',
    },
    {
      testMode: true,
    }
  )

  const result = await nab.addToken('123456789', {
    cardNumber: '4219448174236125',
    expiryDate: '01/26',
    // CVV: '821'
    transactionReference: 'test transaction - node-nab-api',
  })

  // Check variations
  t.true(isIsoDateString(result.MessageInfo.messageTimestamp))
  result.MessageInfo.messageTimestamp = '2018-07-03T06:59:16.539Z'

  const expected = {
    MessageInfo: {
      messageID: '123456789',
      messageTimestamp: '2018-07-03T06:59:16.539Z',
      apiVersion: 'xml-4.2',
    },
    RequestType: 'Payment',
    MerchantInfo: {
      merchantID: 'XYZ0010',
    },
    Status: {
      statusCode: '0',
      statusDescription: 'Normal',
    },
    Data: {
      responseCode: '00',
      responseText: 'Successful',
      successful: 'yes',
      tokenValue: '6743104221086341',
      CreditCardInfo: {
        pan: '421944XXXXXXX125',
        expiryDate: '01/26',
        cardType: '6',
        cardDescription: 'Visa',
      },
      amount: '100',
      transactionReference: 'test transaction - node-nab-api',
    },
  }

  t.deepEqual(result, expected)
})
