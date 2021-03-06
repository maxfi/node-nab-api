import { getResponse } from '../../src/utils/get-response';
import { fromXml } from '../../src/utils/send-request';

const RESPONSE = `<?xml version="1.0" encoding="UTF-8"?>
<NABTransactMessage>
    <MessageInfo>
        <messageID>8af793f9af34bea0ecd7eff711c9d3</messageID>
        <messageTimestamp>20140710115921873000+600</messageTimestamp>
        <apiVersion>spxml-3.0</apiVersion>
    </MessageInfo>
    <RequestType>addToken</RequestType>
    <MerchantInfo>
        <merchantID>XYZ00</merchantID>
    </MerchantInfo>
    <Status>
        <statusCode>0</statusCode>
        <statusDescription>Normal</statusDescription>
    </Status>
    <Token>
        <TokenList count="1">
            <TokenItem ID="1">
                <responseCode>00</responseCode>
                <responseText>Successful</responseText>
                <successful>yes</successful>
                <tokenValue>1234123412341234</tokenValue>
                <CreditCardInfo>
                    <pan>444433XXXXXXX111</pan>
                    <expiryDate>11/15</expiryDate>
                    <cardType>6</cardType>
                    <cardDescription>Visa</cardDescription>
                </CreditCardInfo>
                <amount>100</amount>
                <transactionReference/> </TokenItem>
        </TokenList>
    </Token>
</NABTransactMessage>`;

test('getResponse', () => {
  const response = getResponse(fromXml(RESPONSE));
  expect(response).toMatchSnapshot();
});
