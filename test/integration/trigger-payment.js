import test from 'ava'
import NAB from '../../src'
import isIsoDateString from '../helpers/is-iso-date-string'

// NOTE: API returns duplicate XML envelopes in response.
// Although technically a bad response it doesn't create
// an issue for this package.

test('NAB.triggerPayment - success', async t => {
  const nab = new NAB(
    {
      merchantId: 'XYZ0010',
      password: 'abcd1234',
    },
    {
      testMode: true,
    }
  )

  const result = await nab.triggerPayment('123456789', {
    crn: 'testTokenId180703',
    amount: '100',
    transactionReference: 'test transaction - node-nab-api',
  })

  // Check variations
  t.true(isIsoDateString(result.MessageInfo.messageTimestamp))
  result.MessageInfo.messageTimestamp = '2018-07-03T06:59:16.539Z'
  t.regex(result.Data.txnID, /^\d+$/)
  result.Data.txnID = '815056'
  t.regex(result.Data.settlementDate, /^\d{8}$/)
  result.Data.settlementDate = '20171122'

  const expected = {
    MessageInfo: {
      messageID: '123456789',
      messageTimestamp: '2018-07-03T06:59:16.539Z',
      apiVersion: 'spxml-3.0',
    },
    RequestType: 'Periodic',
    MerchantInfo: { merchantID: 'XYZ0010' },
    Status: { statusCode: '0', statusDescription: 'Normal' },
    Data: {
      crn: 'testTokenId180703',
      actionType: 'trigger',
      periodicType: '8',
      responseCode: '00',
      responseText: 'Approved',
      successful: 'yes',
      isApproved: true,
      transactionReference: 'test transaction - node-nab-api',
      amount: '100',
      currency: 'AUD',
      txnID: '815056',
      settlementDate: '20171122',
      CreditCardInfo: {
        pan: '555555...444',
        expiryDate: '12/23',
        cardType: '5',
        cardDescription: 'Master Card',
      },
    },
  }

  t.deepEqual(result, expected)
})

test('NAB.triggerPayment - failure', async t => {
  const nab = new NAB(
    {
      merchantId: 'XYZ0010',
      password: 'abcd1234',
    },
    {
      testMode: true,
    }
  )

  const result = await nab.triggerPayment('123456789', {
    crn: 'testTokenId180703',
    amount: '105',
    transactionReference: 'test transaction - node-nab-api',
  })

  // Check variations
  t.true(isIsoDateString(result.MessageInfo.messageTimestamp))
  result.MessageInfo.messageTimestamp = '2018-07-03T06:59:16.539Z'
  t.regex(result.Data.txnID, /^\d+$/)
  result.Data.txnID = '815056'
  t.regex(result.Data.settlementDate, /^\d{8}$/)
  result.Data.settlementDate = '20171122'

  const expected = {
    MessageInfo: {
      messageID: '123456789',
      messageTimestamp: '2018-07-03T06:59:16.539Z',
      apiVersion: 'spxml-3.0',
    },
    RequestType: 'Periodic',
    MerchantInfo: { merchantID: 'XYZ0010' },
    Status: { statusCode: '0', statusDescription: 'Normal' },
    Data: {
      crn: 'testTokenId180703',
      actionType: 'trigger',
      periodicType: '8',
      responseCode: '05',
      responseText: 'Do Not Honour',
      successful: 'no',
      isApproved: false,
      transactionReference: 'test transaction - node-nab-api',
      amount: '105',
      currency: 'AUD',
      txnID: '815056',
      settlementDate: '20171122',
      CreditCardInfo: {
        pan: '555555...444',
        expiryDate: '12/23',
        cardType: '5',
        cardDescription: 'Master Card',
      },
    },
  }

  t.deepEqual(result, expected)
})
