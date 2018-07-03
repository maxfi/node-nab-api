# node-nab-api

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

NAB payment gateway API wrapper for node.js

## Classes

<dl>
<dt><a href="#NAB">NAB</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#addToken">addToken(messageId, tokenDetails)</a> ⇒ <code>Promise</code></dt>
<dd></dd>
<dt><a href="#lookupToken">lookupToken(messageId, tokenValue)</a> ⇒ <code>Promise</code></dt>
<dd></dd>
<dt><a href="#deleteToken">deleteToken(messageId, tokenValue)</a> ⇒ <code>Promise</code></dt>
<dd></dd>
<dt><a href="#triggerPayment">triggerPayment(messageId, paymentDetails)</a> ⇒ <code>Promise</code></dt>
<dd></dd>
</dl>

<a name="NAB"></a>

## NAB
**Kind**: global class  
<a name="addToken"></a>

## addToken(messageId, tokenDetails) ⇒ <code>Promise</code>
**Kind**: global function  
**Summary**: Add a new token  
**Returns**: <code>Promise</code> - {MessageInfo, RequestType, MerchantInfo, Status, Data}  

| Param | Type | Description |
| --- | --- | --- |
| messageId | <code>String</code> | The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request. |
| tokenDetails | <code>Object</code> | Token details. |
| tokenDetails.cardNumber | <code>String</code> | Credit card number. |
| tokenDetails.expiryDate | <code>String</code> | Credit card expiry date. |


Example response:

```js
const result = {
  MessageInfo: {
    messageID: '123456789',
    messageTimestamp: '2017-10-20T00:00:00.000Z',
    apiVersion: 'xml-4.2'
  },
  RequestType: 'Payment',
  MerchantInfo: {
    merchantID: 'XYZ0010'
  },
  Status: {
    statusCode: '0',
    statusDescription: 'Normal'
  },
  Data: {
    responseCode: '00',
    responseText: 'Successful',
    successful: 'yes',
    tokenValue: '8714448311797575',
    CreditCardInfo: {
      pan: '444433XXXXXXX111',
      expiryDate: '08/23',
      cardType: '6',
      cardDescription: 'Visa'
    },
    amount: '100',
    transactionReference: {}
  }
}
```

<a name="lookupToken"></a>

## lookupToken(messageId, tokenValue) ⇒ <code>Promise</code>
**Kind**: global function  
**Returns**: <code>Promise</code> - {MessageInfo, RequestType, MerchantInfo, Status, Data}  

| Param | Type | Description |
| --- | --- | --- |
| messageId | <code>String</code> | The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request. |
| tokenValue | <code>String</code> | The token value that represents a stored card within NAB Transact. |

Example response:

```js
const result = {
  MessageInfo: {
    messageID: '123456789',
    messageTimestamp: '2017-10-20T00:00:00.000Z',
    apiVersion: 'xml-4.2'
  },
  RequestType: 'lookupToken',
  MerchantInfo: { merchantID: 'XYZ0010' },
  Status: { statusCode: '0', statusDescription: 'Normal' },
  Data: {
    responseCode: '00',
    responseText: 'Successful',
    successful: 'yes',
    tokenValue: '8714448311797575',
    CreditCardInfo: {
      pan: '444433XXXXXXX111',
      expiryDate: '08/23',
      cardType: '6',
      cardDescription: 'Visa'
    },
    amount: '100',
    transactionReference: {}
  }
}
```

<a name="deleteToken"></a>

## deleteToken(messageId, tokenValue) ⇒ <code>Promise</code>
**Kind**: global function  
**Returns**: <code>Promise</code> - {MessageInfo, RequestType, MerchantInfo, Status, Data}  

| Param | Type | Description |
| --- | --- | --- |
| messageId | <code>String</code> | The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request. |
| tokenValue | <code>String</code> | The token value that represents a stored card within NAB |

Example response:

```js
const result = {
  MessageInfo: {
    messageID: '123456789',
    messageTimestamp: '20172211194828703000+660',
    apiVersion: 'spxml-3.0'
  },
  RequestType: 'deleteToken',
  MerchantInfo: { merchantID: 'XYZ0010' },
  Status: { statusCode: '0', statusDescription: 'Normal' },
  Data: {
    responseCode: '00',
    responseText: 'Successful',
    successful: 'yes',
    CreditCardInfo: {
      pan: {},
      expiryDate: {},
      cardType: '0',
      cardDescription: {}
    },
    amount: '100',
    transactionReference: {}
  }
}
```

<a name="triggerPayment"></a>

## triggerPayment(messageId, paymentDetails) ⇒ <code>Promise</code>
**Kind**: global function  
**Returns**: <code>Promise</code> - {MessageInfo, RequestType, MerchantInfo, Status, Data}  

| Param | Type | Description |
| --- | --- | --- |
| messageId | <code>String</code> | The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request. |
| paymentDetails | <code>Object</code> | {timeout, testMode} |
| paymentDetails.clientID | <code>String</code> | Unique identifier of payor or token. |
| paymentDetails.currency | <code>String</code> | Default currency is "AUD" – Australian Dollars. |
| paymentDetails.amount | <code>String</code> | Transaction amount in cents. |
| paymentDetails.tokenDetails.transactionReference | <code>String</code> | The transaction identifier. This value will appear against all processed transactions. Typically an invoice number. E.g. "invoice12345". If absent the Token value will be used. |

Example response:

```js
const result = {
  MessageInfo: {
    messageID: '123456789',
    messageTimestamp: '20172211193559912000+660',
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
  }
}
```

## Tests

```sh
npm install
npm test
```

## Dependencies

* [is-plain-object](https://github.com/jonschlinkert/is-plain-object): Returns
  true if an object was created by the `Object` constructor.
* [node-fetch](https://github.com/bitinn/node-fetch): A light-weight module that
  brings window.fetch to node.js and io.js
* [xml-js](https://github.com/nashwaan/xml-js): A convertor between XML text and
  Javascript object / JSON text.

## License

UNLICENSED