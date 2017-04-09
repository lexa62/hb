import Constants  from '../constants';

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
      return { ...state, transactions: [action.transaction, ...state.transactions]};

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
