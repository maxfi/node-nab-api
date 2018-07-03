import getMessage from './get-message'

// Opts = {messageId, credentials, requestType, dataElementName, payload, options}
export default opts => {
  opts.options = opts.options || {}
  return {
    _declaration: {
      _attributes: {
        version: '1.0',
        encoding: 'UTF-8',
      },
    },
    NABTransactMessage: {
      MessageInfo: {
        messageID: {
          _text: opts.messageId,
        },
        messageTimestamp: {
          _text: new Date().toISOString(),
        },
        timeoutValue: {
          _text: opts.options.timeout || '60',
        },
        apiVersion: {
          _text: 'spxml-3.0',
        },
      },
      MerchantInfo: {
        merchantID: {
          _text: opts.credentials.merchantId,
        },
        password: {
          _text: opts.credentials.password,
        },
      },
      RequestType: {
        _text: opts.requestType,
      },
      [opts.dataElementName]: {
        [opts.dataElementName + 'List']: {
          _attributes: {
            count: '1',
          },
          [opts.dataElementName + 'Item']: Object.assign(
            { _attributes: { ID: '1' } },
            getMessage(opts.payload)
          ),
        },
      },
    },
  }
}
