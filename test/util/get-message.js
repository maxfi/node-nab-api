import test from 'ava'
import getMessage from '../../src/util/get-message'

test('getMessage', t => {
  t.deepEqual(
    getMessage({
      actionType: 'add',
      CreditCardInfo: {
        cardHolderName: 'Eddie Murphy',
      },
    }),
    {
      actionType: {
        _text: 'add',
      },
      CreditCardInfo: {
        cardHolderName: {
          _text: 'Eddie Murphy',
        },
      },
    }
  )
})

test('getMessage throws when input is not a plain object', t => {
  t.throws(() => getMessage('not an object'))
})
