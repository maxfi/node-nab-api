import fetch from 'node-fetch';
import { js2xml, xml2js } from 'xml-js';
import { getResponse } from './get-response';

export const toXml = (x: object) => js2xml(x, { spaces: 4, compact: true });
export const fromXml = (str: string) => xml2js(str, { compact: true });

/**
 * Make the request to the NAB payment gateway API.
 * Converts the payload to XML and converts the response to Object.
 * @param  url - Endpoint URL.
 * @param  payload - Request body.
 * @return Returns the API response as Object.
 */
export const sendRequest = async (url: string, payload: object) => {
  const xml = toXml(payload);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: xml,
  });
  if (!response.ok) {
    const { status, statusText } = response;
    console.log('REQUEST:', url, ':', xml);
    throw new Error(`Bad response from NAB API: ${status} - ${statusText}`);
  }
  const body = await response.text();
  return getResponse(fromXml(body));
};
