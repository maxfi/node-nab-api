import { getMessage } from './get-message';

export const getMessageContainer = (input: {
  messageId: string;
  credentials: { merchantId: string; password: string };
  requestType: string;
  dataElementName: string;
  payload: object;
  options: { timeout?: string };
}) => {
  input.options = input.options || {};
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
          _text: input.messageId,
        },
        messageTimestamp: {
          _text: new Date().toISOString(),
        },
        timeoutValue: {
          _text: input.options.timeout || '60',
        },
        apiVersion: {
          _text: 'spxml-3.0',
        },
      },
      MerchantInfo: {
        merchantID: {
          _text: input.credentials.merchantId,
        },
        password: {
          _text: input.credentials.password,
        },
      },
      RequestType: {
        _text: input.requestType,
      },
      [input.dataElementName]: {
        [input.dataElementName + 'List']: {
          _attributes: {
            count: '1',
          },
          [input.dataElementName + 'Item']: Object.assign(
            { _attributes: { ID: '1' } },
            getMessage(input.payload)
          ),
        },
      },
    },
  };
};
