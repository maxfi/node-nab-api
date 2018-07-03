import { js2xml, xml2js } from 'xml-js'
import fetch from 'node-fetch'
import getMessageContainer from './util/get-message-container'
import getResponse from './util/get-response'

const toXml = x => js2xml(x, { spaces: 4, compact: true })
const fromXml = x => xml2js(x, { compact: true })

/**
 * Make the request to the NAB payment gateway API.
 * Converts the payload to XML and converts the response to Object.
 * @private
 * @param {String} url - Endpoint URL.
 * @param {Object} payload - Request body.
 * @return {Object} Returns the API response as Object.
 */
const request = async (url, payload) => {
  const xml = toXml(payload)
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: xml,
  })
  if (!response.ok) {
    const { status, statusText } = response
    console.log('REQUEST:', url, ':', xml)
    throw new Error(`Bad response from NAB API: ${status} - ${statusText}`)
  }
  const body = await response.text()
  return getResponse(fromXml(body))
}

/**
 * Extracts the relevant data from the response
 * @private
 * @param {Object} response - API response as Object
 * @param {String} el - Name of the root XML element that contains the data
 * @return {Object} {MessageInfo, RequestType, MerchantInfo, Status, Data}
 */
const clean = (response, el) => {
  const result = response.NABTransactMessage
  result.Data = result[el][el + 'List'][el + 'Item']
  delete result.Data._attributes
  delete result[el]
  return result
}

/**
 * @class NAB
 */
export default class NAB {
  /**
   * Creates an instance of the NAB class.
   * @constructor
   * @param {Object} config Config.
   * @param {String} config.merchantId 5 character merchant ID supplied by NAB Transact.
   * @param {String} config.password Transaction password. Password used for authentication of the merchant's request message, supplied by NAB Transact.
   * @param {Object} [options] Options.
   * @param {Boolean} options.testMode Set to `true` to direct requests to the NAB payment gateway test environment.
   * @param {String} options.timeout Timeout value used, in seconds.
   */
  constructor(config, options = {}) {
    this.merchantId = config.merchantId
    this.password = config.password
    this.baseUrl = options.testMode
      ? 'https://demo.transact.nab.com.au/xmlapi/'
      : 'https://transact.nab.com.au/live/xmlapi/'
  }

  _getCredentials() {
    return {
      merchantId: this.merchantId,
      password: this.password,
    }
  }

  async _post(type, payload) {
    // Capitalize the element. Eg -> 'token' to 'Token'
    const el = type.charAt(0).toUpperCase() + type.slice(1)
    const url = this.baseUrl + type
    const response = await request(url, payload)
    return clean(response, el)
  }

  /**
   * @summary Add a new token
   * @param {String} messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
   * @param {Object} tokenDetails Token details.
   * @param {String} tokenDetails.cardNumber Credit card number.
   * @param {String} tokenDetails.expiryDate Credit card expiry date.
   * @returns {Promise} {MessageInfo, RequestType, MerchantInfo, Status, Data}
   */
  addToken(messageId, tokenDetails) {
    const payload = getMessageContainer({
      messageId,
      credentials: this._getCredentials(),
      requestType: 'addToken',
      dataElementName: 'Token',
      payload: {
        ...tokenDetails,
        tokenType: 1, // The type of token created. Defaults to 1 if absent. Type 1 is 16 digits, not based on the card number, failing the LUHN check.
      },
    })
    return this._post('token', payload)
  }

  /**
   * @param {String} messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
   * @param {String} tokenValue The token value that represents a stored card within NAB Transact.
   * @returns {Promise} {MessageInfo, RequestType, MerchantInfo, Status, Data}
   */
  lookupToken(messageId, tokenValue) {
    const payload = getMessageContainer({
      messageId,
      credentials: this._getCredentials(),
      requestType: 'lookupToken',
      dataElementName: 'Token',
      payload: { tokenValue },
    })
    return this._post('token', payload)
  }

  /**
   * @param {String} messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
   * @param {String} tokenValue The token value that represents a stored card within NAB
   * @returns {Promise} {MessageInfo, RequestType, MerchantInfo, Status, Data}
   */
  deleteToken(messageId, tokenValue) {
    const payload = getMessageContainer({
      messageId,
      credentials: this._getCredentials(),
      requestType: 'deleteToken',
      dataElementName: 'Token',
      payload: {
        actionType: 'delete',
        tokenValue,
      },
    })
    return this._post('token', payload)
  }

  /**
   * @param {String} messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
   * @param {Object} paymentDetails {timeout, testMode}
   * @param {String} paymentDetails.clientID Unique identifier of payor or token.
   * @param {String} paymentDetails.currency Default currency is "AUD" – Australian Dollars.
   * @param {String} paymentDetails.amount Transaction amount in cents.
   * @param {String} paymentDetails.tokenDetails.transactionReference The transaction identifier. This value will appear against all processed transactions. Typically an invoice number. E.g. "invoice12345". If absent the Token value will be used.
   * @returns {Promise} {MessageInfo, RequestType, MerchantInfo, Status, Data}
   */
  triggerPayment(messageId, paymentDetails) {
    const payload = getMessageContainer({
      messageId,
      credentials: this._getCredentials(),
      requestType: 'Periodic',
      dataElementName: 'Periodic',
      payload: {
        currency: 'AUD',
        ...paymentDetails,
        actionType: 'trigger',
        periodicType: '8',
      },
    })
    return this._post('periodic', payload)
  }
}
