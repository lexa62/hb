import Constants from '../constants';

const initialState = {
  ownedAccounting: [],
  participatedAccounting: [],
  fetching: true,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case Constants.ACCOUNTING_FETCHING:
      return { ...state, fetching: true };

    case Constants.ACCOUNTING_RECEIVED:
      return { ...state, ownedAccounting: action.ownedAccounting, participatedAccounting: action.participatedAccounting, fetching: false };

    default:
      return state;
  }
}
