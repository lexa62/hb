import Constants  from '../constants';
import update from 'immutability-helper';

const initialState = {
  channel: null,
  error: null,
  fetching: true,
  fetching_financial_goals: true
};

export default function reducer(state = initialState, action = {}) {
  let old_financial_goals = null;
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


    case Constants.CURRENT_ACCOUNTING_FINANCIAL_GOALS_FETCHING:
      return { ...state, fetching_financial_goals: true };

    case Constants.CURRENT_ACCOUNTING_FINANCIAL_GOALS_RECEIVED:
      return { ...state, fetching_financial_goals: false, financial_goals: action.financial_goals };

    case Constants.CURRENT_ACCOUNTING_EDIT_FINANCIAL_GOAL:
      return { ...state, editingFinancialGoalId: action.id };

    case Constants.CURRENT_ACCOUNTING_FINANCIAL_GOAL_CREATED:
      const financial_goals = state.financial_goals;
      if (financial_goals) {
        const new_financial_goals = update(financial_goals, {$push: [action.financial_goal]})
        return { ...state, financial_goals: new_financial_goals, showFinancialGoalForm: false };
      } else return { ...state, showFinancialGoalForm: false };

    case Constants.CURRENT_ACCOUNTING_FINANCIAL_GOAL_UPDATED:
      old_financial_goals = state.financial_goals;
      if (old_financial_goals) {
        const financial_goal_index = old_financial_goals.findIndex((goal) => { return goal.id == action.financial_goal.id; });
        const new_financial_goals = update(old_financial_goals, {[financial_goal_index]: {$set: action.financial_goal}})
        return { ...state, financial_goals: new_financial_goals, editingFinancialGoalId: null };
      } else return { ...state, editingFinancialGoalId: null };

    case Constants.CURRENT_ACCOUNTING_FINANCIAL_GOAL_REMOVED:
      old_financial_goals = state.financial_goals;
      if (old_financial_goals) {
        const financial_goal_index = old_financial_goals.findIndex((goal) => { return goal.id == action.id; });
        const new_financial_goals = update(old_financial_goals, {$splice: [[financial_goal_index, 1]]});
        return { ...state, financial_goals: new_financial_goals };
      } else return state;

    case Constants.CURRENT_ACCOUNTING_SHOW_FINANCIAL_GOAL_FORM:
      return { ...state, showFinancialGoalForm: action.show };



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
