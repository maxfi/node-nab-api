import test from 'ava'
import xmljs from 'xml-js'
import readFile from '../helpers/read-file'
import getMessageContainer from '../../src/util/get-message-container'

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
}

const toXml = x => xmljs.js2xml(x, { spaces: 4, compact: true })
const removeTimestamp = x =>
  x.replace(/<messageTimestamp>.*<\/messageTimestamp>/, '')

test('getMessageContainer', t => {
  const result = getMessageContainer(payload)
  const expected = {
    _declaration: {
      _attributes: {
        version: '1.0',
        encoding: 'UTF-8',
      },
    },
    NABTransactMessage: {
      MessageInfo: {
        messageID: {
          _text: '8af793f9af34bea0ecd7eff711c9d3',
        },
        messageTimestamp: {
          _text: result.NABTransactMessage.MessageInfo.messageTimestamp._text, // The timestamp is generated as part of the container
        },
        timeoutValue: {
          _text: '60',
        },
        apiVersion: {
          _text: 'spxml-3.0',
        },
      },
      MerchantInfo: {
        merchantID: {
          _text: 'XYZ00',
        },
        password: {
          _text: 'abcd1234',
        },
      },
      RequestType: {
        _text: 'addToken',
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
            cardNumber: {
              _text: '4444333322221111',
            },
            expiryDate: {
              _text: '11/15',
            },
            tokenType: {
              _text: '1',
            },
          },
        },
      },
    },
  }

  t.deepEqual(result, expected)
})

test('getMessageContainer should create the correct object to be parsed to XML', async t => {
  const expected = removeTimestamp(
    await readFile('test/fixtures/add-token-request.xml')
  )
  const xml = removeTimestamp(toXml(getMessageContainer(payload)))
  t.is(xml, expected)
})
