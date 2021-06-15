import { getMessage } from '../../src/utils/get-message';

test('getMessage', () => {
  const message = getMessage({
    actionType: 'add',
    CreditCardInfo: {
      cardHolderName: 'Eddie Murphy',
    },
  });

  const expected = {
    actionType: {
      _text: 'add',
    },
    CreditCardInfo: {
      cardHolderName: {
        _text: 'Eddie Murphy',
      },
    },
  };

  expect(message).toEqual(expected);
});

test('getMessage throws when input is not a plain object', () => {
  //@ts-ignore
  expect(() => getMessage('not an object')).toThrow();
});
