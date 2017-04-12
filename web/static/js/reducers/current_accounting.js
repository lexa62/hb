import Constants  from '../constants';
import update from 'immutability-helper';

const initialState = {
  channel: null,
  error: null,
  fetching: true,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case Constants.CURRENT_ACCOUNTING_FETCHING:
      return { ...state, fetching: true };

    case Constants.CURRENT_ACCOUNTING_SETTED:
      return { ...state, fetching: false, ...action.accounting };

    case Constants.CURRENT_ACCOUNTING_CONNECTED_TO_CHANNEL:
      return { ...state, channel: action.channel };

    case Constants.CURRENT_ACCOUNTING_TRANSACTION_CREATED:
      const accounts = state.accounts;
      const accountIndex = accounts.findIndex((account) => { return account.id == action.currency_balance.account_id; });
      const currencyBalanceIndex = accounts[accountIndex].currency_balances.findIndex((currencyBalance) => { return currencyBalance.id == action.currency_balance.id; });
      let newArray = []
      if(currencyBalanceIndex != -1) {
        newArray = update(accounts, {[accountIndex]: {currency_balances: {[currencyBalanceIndex]: {$set: action.currency_balance}}}});
      }
      else {
        newArray = update(accounts, {[accountIndex]: {currency_balances: {$push: [action.currency_balance]}}});
      }
      return { ...state, transactions: [action.transaction, ...state.transactions], accounts: newArray};
      // const accounts = state.accounts;
      // const accountIndex = accounts.findIndex((account) => { return account.id == action.currency_balance.account_id; });
      // const currencyBalanceIndex = accounts[accountIndex].currency_balances.findIndex((currencyBalance) => { return currencyBalance.id == action.currency_balance.id; });
      // const newArray = update(accounts, {[accountIndex]: {currency_balances: {[currencyBalanceIndex]: {$set: action.currency_balance}}}});
      // return { ...state, transactions: [action.transaction, ...state.transactions], accounts: newArray};

    case Constants.CURRENT_ACCOUNTING_MEMBER_ADDED:
      return { ...state, error: null };

    case Constants.CURRENT_ACCOUNTING_ADD_MEMBER_ERROR:
      return { ...state, error: action.error };

    case Constants.CURRENT_ACCOUNTING_RESET:
      return initialState;

    default:
      return state;
  }
}
