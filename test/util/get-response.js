import test from 'ava'
import xmljs from 'xml-js'
import readFile from '../helpers/read-file'
import getResponse from '../../src/util/get-response'

const fromXml = x => xmljs.xml2js(x, { compact: true })

test('getResponse', async t => {
  const expected = {
    _declaration: {
      _attributes: {
        version: '1.0',
        encoding: 'UTF-8',
      },
    },
    NABTransactMessage: {
      MessageInfo: {
        messageID: '8af793f9af34bea0ecd7eff711c9d3',
        messageTimestamp: '20140710115921873000+600',
        apiVersion: 'spxml-3.0',
      },
      RequestType: 'addToken',
      MerchantInfo: {
        merchantID: 'XYZ00',
      },
      Status: {
        statusCode: '0',
        statusDescription: 'Normal',
      },
      Token: {
        TokenList: {
          _attributes: {
            count: '1',
          },
          TokenItem: {
            _attributes: {
              ID: '1',
            },
            responseCode: '00',
            responseText: 'Successful',
            successful: 'yes',
            tokenValue: '1234123412341234',
            CreditCardInfo: {
              pan: '444433XXXXXXX111',
              expiryDate: '11/15',
              cardType: '6',
              cardDescription: 'Visa',
            },
            amount: '100',
            transactionReference: {},
          },
        },
      },
    },
  }
  const response = getResponse(
    fromXml(await readFile('test/fixtures/add-token-response.xml'))
  )
  t.deepEqual(response, expected)
})
