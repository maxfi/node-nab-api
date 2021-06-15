import { getMessageContainer } from './utils/get-message-container';
import { normaliseDateString } from './utils/normalise-date-string';
import { sendRequest } from './utils/send-request';

interface ResponseBase {
  MessageInfo: MessageInfo;
  RequestType: string;
  MerchantInfo: MerchantInfo;
  Status: Status;
}

interface NABTransactTokenResponse extends ResponseBase {
  RequestType: 'Payment' | 'lookupToken' | 'deleteToken';
  Data: Data;
}

interface NABTransactPaymentResponse extends ResponseBase {
  RequestType: 'Periodic';
  Data: TriggerPaymentData;
}

interface TriggerPaymentData {
  crn: string;
  actionType: string;
  periodicType: string;
  responseCode: string;
  responseText: string;
  successful: string;
  transactionReference: string;
  amount: string;
  currency: string;
  txnID: string;
  settlementDate: string;
  CreditCardInfo: CreditCardInfo;
}

interface Data {
  responseCode: string;
  responseText: string;
  successful: string;
  tokenValue: string;
  CreditCardInfo: CreditCardInfo;
  amount: string;
  transactionReference: string;
}

interface CreditCardInfo {
  pan: string;
  expiryDate: string;
  cardType: string;
  cardDescription: string;
}

interface MerchantInfo {
  merchantID: string;
}

interface MessageInfo {
  messageID: string;
  messageTimestamp: string;
  apiVersion: string;
}

interface Status {
  statusCode: string;
  statusDescription: string;
}

/**
 * Extracts the relevant data from the response
 * @private
 * @param response - API response as Object
 * @param  el - Name of the root XML element that contains the data
 */
const clean = (response: any, el: string) => {
  const result = response.NABTransactMessage;
  result.Data = result[el][el + 'List'][el + 'Item'];
  delete result.Data._attributes;
  delete result[el];
  return result;
};

export class NAB {
  private merchantId: string;
  private password: string;
  private baseUrl: string;
  private timeout?: string;
  /**
   * Creates an instance of the NAB class.
   * @constructor
   * @param config Config.
   * @param config.merchantId 5 character merchant ID supplied by NAB Transact.
   * @param config.password Transaction password. Password used for authentication of the merchant's request message, supplied by NAB Transact.
   * @param options Options.
   * @param options.testMode Set to `true` to direct requests to the NAB payment gateway test environment.
   * @param options.timeout Timeout value used, in seconds.
   */
  constructor(config: {
    merchantId: string;
    password: string;
    testMode: boolean;
    timeout?: string;
  }) {
    this.merchantId = config.merchantId;
    this.password = config.password;
    this.baseUrl = config.testMode
      ? 'https://demo.transact.nab.com.au/xmlapi/'
      : 'https://transact.nab.com.au/live/xmlapi/';
    this.timeout = config.timeout;
  }

  private _getCredentials() {
    return {
      merchantId: this.merchantId,
      password: this.password,
    };
  }

  private async _post(
    type: 'token',
    payload: object
  ): Promise<NABTransactTokenResponse>;
  private async _post(
    type: 'periodic',
    payload: object
  ): Promise<NABTransactPaymentResponse>;
  private async _post(type: 'token' | 'periodic', payload: object) {
    // Capitalize the element. Eg -> 'token' to 'Token'
    const el = type.charAt(0).toUpperCase() + type.slice(1);
    const url = this.baseUrl + type;
    const response = await sendRequest(url, payload);
    return clean(response, el);
  }

  /**
   * @summary Add a new token
   * @param messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
   * @param tokenDetails Token details.
   * @param tokenDetails.cardNumber Credit card number.
   * @param tokenDetails.expiryDate Credit card expiry date.
   */
  public addToken(
    messageId: string,
    tokenDetails: { cardNumber: string; expiryDate: string }
  ) {
    const payload = getMessageContainer({
      messageId,
      credentials: this._getCredentials(),
      requestType: 'addToken',
      dataElementName: 'Token',
      payload: {
        ...tokenDetails,
        tokenType: 1, // The type of token created. Defaults to 1 if absent. Type 1 is 16 digits, not based on the card number, failing the LUHN check.
      },
      options: { timeout: this.timeout },
    });
    return this._post('token', payload);
  }

  /**
   * @param messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
   * @param tokenValue The token value that represents a stored card within NAB Transact.
   */
  public lookupToken(messageId: string, tokenValue: string) {
    const payload = getMessageContainer({
      messageId,
      credentials: this._getCredentials(),
      requestType: 'lookupToken',
      dataElementName: 'Token',
      payload: { tokenValue },
      options: { timeout: this.timeout },
    });
    return this._post('token', payload);
  }

  /**
   * @param messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
   * @param tokenValue The token value that represents a stored card within NAB
   */
  public deleteToken(messageId: string, tokenValue: string) {
    const payload = getMessageContainer({
      messageId,
      credentials: this._getCredentials(),
      requestType: 'deleteToken',
      dataElementName: 'Token',
      payload: {
        actionType: 'delete',
        tokenValue,
      },
      options: { timeout: this.timeout },
    });
    return this._post('token', payload);
  }

  /**
   * @param messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
   * @param paymentDetails Payment Details
   * @param paymentDetails.crn Unique identifier of customer or token.
   * @param paymentDetails.currency Default currency is "AUD" – Australian Dollars.
   * @param paymentDetails.amount Transaction amount in cents.
   * @param paymentDetails.transactionReference The transaction identifier. This value will appear against all processed transactions. Typically an invoice number. E.g. "invoice12345".
   */
  public async triggerPayment(
    messageId: string,
    paymentDetails: {
      crn: string;
      amount: string;
      transactionReference: string;
    }
  ) {
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
      options: { timeout: this.timeout },
    });
    const response = await this._post('periodic', payload);

    /**
     * The test API returns inconsistently formatted timestamps.
     * The token CRUD endpoints return an ISO 8601 formatted `messageTimestamp`,
     * for example: `2018-07-18T10:27:38.738Z`.
     * The trigger payment endpoint, however, returns a non ISO formatted
     * `messageTimestamp`, for example: `20181807202744603000+600`.
     * Unfortunately the NAB transact documentation is inconsistent here again.
     */
    response.MessageInfo.messageTimestamp = normaliseDateString(
      response.MessageInfo.messageTimestamp
    );

    // Reference: XMLAPIIntegrationGuide.pdf - 4.10 Appendix J: NAB Transact Bank Response Codes
    const isApproved = ['00', '08', '11', '16'].includes(
      response.Data.responseCode
    );

    return { ...response, isApproved };
  }
}
