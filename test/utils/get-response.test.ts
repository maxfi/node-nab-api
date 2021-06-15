import { getResponse } from '../../src/utils/get-response';
import { fromXml } from '../../src/utils/send-request';
import { readFileFromPath } from '../helpers/read-file-from-path';

test('getResponse', async () => {
  const response = getResponse(
    fromXml(await readFileFromPath('test/fixtures/add-token-response.xml'))
  );
  expect(response).toMatchSnapshot();
});
