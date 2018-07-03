import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _Object$entries from '@babel/runtime/core-js/object/entries';
import isPlainObject from 'is-plain-object';
import _Object$assign from '@babel/runtime/core-js/object/assign';
import _objectSpread from '@babel/runtime/helpers/objectSpread';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import 'regenerator-runtime/runtime';
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import { js2xml, xml2js } from 'xml-js';
import fetch from 'node-fetch';

var convert = function convert(x) {
  if (isPlainObject(x)) {
    return _Object$entries(x).reduce(function (acc, value) {
      var _value = _slicedToArray(value, 2),
          k = _value[0],
          v = _value[1];

      acc[k] = convert(v);
      return acc;
    }, {});
  }

  return {
    _text: x
  };
};

var getMessage = (function (x) {
  if (!isPlainObject(x)) throw new Error('Requires a plain object');
  return convert(x);
});

var getMessageContainer = (function (opts) {
  opts.options = opts.options || {};
  return {
    _declaration: {
      _attributes: {
        version: '1.0',
        encoding: 'UTF-8'
      }
    },
    NABTransactMessage: {
      MessageInfo: {
        messageID: {
          _text: opts.messageId
        },
        messageTimestamp: {
          _text: new Date().toISOString()
        },
        timeoutValue: {
          _text: opts.options.timeout || '60'
        },
        apiVersion: {
          _text: 'spxml-3.0'
        }
      },
      MerchantInfo: {
        merchantID: {
          _text: opts.credentials.merchantId
        },
        password: {
          _text: opts.credentials.password
        }
      },
      RequestType: {
        _text: opts.requestType
      },
      [opts.dataElementName]: {
        [opts.dataElementName + 'List']: {
          _attributes: {
            count: '1'
          },
          [opts.dataElementName + 'Item']: _Object$assign({
            _attributes: {
              ID: '1'
            }
          }, getMessage(opts.payload))
        }
      }
    }
  };
});

var convert$1 = function convert(x) {
  if (!isPlainObject(x)) return x;
  if (x._text) return x._text;
  return _Object$entries(x).reduce(function (acc, value) {
    var _value = _slicedToArray(value, 2),
        k = _value[0],
        v = _value[1];

    acc[k] = convert(v);
    return acc;
  }, {});
};

var getResponse = (function (x) {
  if (!isPlainObject(x)) throw new Error('Requires a plain object');
  return convert$1(x);
});

var toXml = function toXml(x) {
  return js2xml(x, {
    spaces: 4,
    compact: true
  });
};

var fromXml = function fromXml(x) {
  return xml2js(x, {
    compact: true
  });
};
/**
 * Make the request to the NAB payment gateway API.
 * Converts the payload to XML and converts the response to Object.
 * @private
 * @param {String} url - Endpoint URL.
 * @param {Object} payload - Request body.
 * @return {Object} Returns the API response as Object.
 */


var request =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(url, payload) {
    var xml, response, status, statusText, body;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            xml = toXml(payload);
            _context.next = 3;
            return fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'text/xml'
              },
              body: xml
            });

          case 3:
            response = _context.sent;

            if (response.ok) {
              _context.next = 8;
              break;
            }

            status = response.status, statusText = response.statusText;
            console.log('REQUEST:', url, ':', xml);
            throw new Error(`Bad response from NAB API: ${status} - ${statusText}`);

          case 8:
            _context.next = 10;
            return response.text();

          case 10:
            body = _context.sent;
            return _context.abrupt("return", getResponse(fromXml(body)));

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function request(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
/**
 * Extracts the relevant data from the response
 * @private
 * @param {Object} response - API response as Object
 * @param {String} el - Name of the root XML element that contains the data
 * @return {Object} {MessageInfo, RequestType, MerchantInfo, Status, Data}
 */


var clean = function clean(response, el) {
  var result = response.NABTransactMessage;
  result.Data = result[el][el + 'List'][el + 'Item'];
  delete result.Data._attributes;
  delete result[el];
  return result;
};
/**
 * @class NAB
 */


var NAB =
/*#__PURE__*/
function () {
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
  function NAB(config) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, NAB);

    this.merchantId = config.merchantId;
    this.password = config.password;
    this.baseUrl = options.testMode ? 'https://demo.transact.nab.com.au/xmlapi/' : 'https://transact.nab.com.au/live/xmlapi/';
  }

  _createClass(NAB, [{
    key: "_getCredentials",
    value: function _getCredentials() {
      return {
        merchantId: this.merchantId,
        password: this.password
      };
    }
  }, {
    key: "_post",
    value: function () {
      var _post2 = _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee2(type, payload) {
        var el, url, response;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                // Capitalize the element. Eg -> 'token' to 'Token'
                el = type.charAt(0).toUpperCase() + type.slice(1);
                url = this.baseUrl + type;
                _context2.next = 4;
                return request(url, payload);

              case 4:
                response = _context2.sent;
                return _context2.abrupt("return", clean(response, el));

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function _post(_x3, _x4) {
        return _post2.apply(this, arguments);
      };
    }()
    /**
     * @summary Add a new token
     * @param {String} messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
     * @param {Object} tokenDetails Token details.
     * @param {String} tokenDetails.cardNumber Credit card number.
     * @param {String} tokenDetails.expiryDate Credit card expiry date.
     * @returns {Promise} {MessageInfo, RequestType, MerchantInfo, Status, Data}
     */

  }, {
    key: "addToken",
    value: function addToken(messageId, tokenDetails) {
      var payload = getMessageContainer({
        messageId,
        credentials: this._getCredentials(),
        requestType: 'addToken',
        dataElementName: 'Token',
        payload: _objectSpread({}, tokenDetails, {
          tokenType: 1 // The type of token created. Defaults to 1 if absent. Type 1 is 16 digits, not based on the card number, failing the LUHN check.

        })
      });
      return this._post('token', payload);
    }
    /**
     * @param {String} messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
     * @param {String} tokenValue The token value that represents a stored card within NAB Transact.
     * @returns {Promise} {MessageInfo, RequestType, MerchantInfo, Status, Data}
     */

  }, {
    key: "lookupToken",
    value: function lookupToken(messageId, tokenValue) {
      var payload = getMessageContainer({
        messageId,
        credentials: this._getCredentials(),
        requestType: 'lookupToken',
        dataElementName: 'Token',
        payload: {
          tokenValue
        }
      });
      return this._post('token', payload);
    }
    /**
     * @param {String} messageId The `messageId` is a reference for the xml request. If you had a server internally you could store all your xml request and this would be a way to locate the request if a payment was to fail. A request will still be sent if they have the same `messageId` and will be treated as a new xml request.
     * @param {String} tokenValue The token value that represents a stored card within NAB
     * @returns {Promise} {MessageInfo, RequestType, MerchantInfo, Status, Data}
     */

  }, {
    key: "deleteToken",
    value: function deleteToken(messageId, tokenValue) {
      var payload = getMessageContainer({
        messageId,
        credentials: this._getCredentials(),
        requestType: 'deleteToken',
        dataElementName: 'Token',
        payload: {
          actionType: 'delete',
          tokenValue
        }
      });
      return this._post('token', payload);
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

  }, {
    key: "triggerPayment",
    value: function triggerPayment(messageId, paymentDetails) {
      var payload = getMessageContainer({
        messageId,
        credentials: this._getCredentials(),
        requestType: 'Periodic',
        dataElementName: 'Periodic',
        payload: _objectSpread({
          currency: 'AUD'
        }, paymentDetails, {
          actionType: 'trigger',
          periodicType: '8'
        })
      });
      return this._post('periodic', payload);
    }
  }]);

  return NAB;
}();

export default NAB;
