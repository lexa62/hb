import Constants  from '../constants';
import update from 'immutability-helper';

const initialState = {
  channel: null,
  error: null,
  fetching: true,
  fetching_financial_goals: true,
  report_transactions: [],
  editingCategoryType: Constants.EXPENSE,
  reports_fetching: false
};

export default function reducer(state = initialState, action = {}) {
  let old_financial_goals = null;
  let old_accounts = null;
  let old_currencies = null;
  let old_categories = null;
  let old_transactions = null;
  let newArray = [];

  switch (action.type) {
    case Constants.CURRENT_ACCOUNTING_FETCHING:
      return { ...state, fetching: true };

    case Constants.CURRENT_ACCOUNTING_SETTED:
      return { ...state, fetching: false, ...action.accounting };

    case Constants.CURRENT_ACCOUNTING_CONNECTED_TO_CHANNEL:
      return { ...state, channel: action.channel };

    case Constants.CURRENT_ACCOUNTING_TRANSACTION_CREATED:
      newArray = state.accounts;
      for (let currency_balance of action.currency_balances) {
        const accountIndex = newArray.findIndex(account => account.id == currency_balance.account_id);
        const currencyBalanceIndex = newArray[accountIndex].currency_balances.findIndex(b => b.id == currency_balance.id);
        if(currencyBalanceIndex != -1) {
          newArray = update(newArray, {[accountIndex]: {currency_balances: {[currencyBalanceIndex]: {$set: currency_balance}}}});
        }
        else {
          newArray = update(newArray, {[accountIndex]: {currency_balances: {$push: [currency_balance]}}});
        }
      }
      return { ...state, transactions: [action.transaction, ...state.transactions], accounts: newArray};

    case Constants.CURRENT_ACCOUNTING_EDIT_TRANSACTION:
      return { ...state, editingTransactionId: action.id };

    case Constants.CURRENT_ACCOUNTING_TRANSACTION_UPDATED:
      newArray = state.accounts;
      old_transactions = state.transactions;
      for (let currency_balance of action.currency_balances) {
        const accountIndex = newArray.findIndex(account => account.id == currency_balance.account_id);
        const currencyBalanceIndex = newArray[accountIndex].currency_balances.findIndex(b => b.id == currency_balance.id);
        if(currencyBalanceIndex != -1) {
          newArray = update(newArray, {[accountIndex]: {currency_balances: {[currencyBalanceIndex]: {$set: currency_balance}}}});
        }
        else {
          newArray = update(newArray, {[accountIndex]: {currency_balances: {$push: [currency_balance]}}});
        }
      }

      if (old_transactions) {
        const transaction_index = old_transactions.findIndex((goal) => { return goal.id == action.transaction.id; });
        const new_transactions = update(old_transactions, {[transaction_index]: {$set: action.transaction}})
        return { ...state, transactions: new_transactions, editingTransactionId: null, accounts: newArray };
      } else return { ...state, editingTransactionId: null };

    case Constants.CURRENT_ACCOUNTING_TRANSACTION_REMOVED:
      old_transactions = state.transactions;
      newArray = state.accounts;
      for (let currency_balance of action.currency_balances) {
        const accountIndex = newArray.findIndex(account => account.id == currency_balance.account_id);
        const currencyBalanceIndex = newArray[accountIndex].currency_balances.findIndex(b => b.id == currency_balance.id);
        if(currencyBalanceIndex != -1) {
          newArray = update(newArray, {[accountIndex]: {currency_balances: {[currencyBalanceIndex]: {$set: currency_balance}}}});
        }
        else {
          newArray = update(newArray, {[accountIndex]: {currency_balances: {$push: [currency_balance]}}});
        }
      }

      if (old_transactions) {
        const currency_index = old_transactions.findIndex((goal) => { return goal.id == action.id; });
        const new_transactions = update(old_transactions, {$splice: [[currency_index, 1]]});
        if(state.editingTransactionId && state.editingTransactionId == action.id)
          return { ...state, transactions: new_transactions, accounts: newArray, editingTransactionId: null };
        else
          return { ...state, transactions: new_transactions, accounts: newArray };
      } else return state;



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



    case Constants.CURRENT_ACCOUNTING_EDIT_ACCOUNT:
      return { ...state, editingAccountId: action.id };

    case Constants.CURRENT_ACCOUNTING_ACCOUNT_CREATED:
      old_accounts = state.accounts;
      if (old_accounts) {
        const new_accounts = update(old_accounts, {$push: [action.account]})
        return { ...state, accounts: new_accounts };
      } else return state;

    case Constants.CURRENT_ACCOUNTING_ACCOUNT_UPDATED:
      old_accounts = state.accounts;
      if (old_accounts) {
        const account_index = old_accounts.findIndex((goal) => { return goal.id == action.account.id; });
        const new_accounts = update(old_accounts, {[account_index]: {$set: action.account}})
        return { ...state, accounts: new_accounts, editingAccountId: null };
      } else return { ...state, editingAccountId: null };

    case Constants.CURRENT_ACCOUNTING_ACCOUNT_REMOVED:
      old_accounts = state.accounts;
      if (old_accounts) {
        const account_index = old_accounts.findIndex((goal) => { return goal.id == action.id; });
        const new_accounts = update(old_accounts, {$splice: [[account_index, 1]]});
        if(state.editingAccountId && state.editingAccountId == action.id)
          return { ...state, accounts: new_accounts, editingAccountId: null };
        else
          return { ...state, accounts: new_accounts };
      } else return state;



    case Constants.CURRENT_ACCOUNTING_EDIT_CURRENCY:
      return { ...state, editingCurrencyId: action.id };

    case Constants.CURRENT_ACCOUNTING_CURRENCY_CREATED:
      old_currencies = state.currencies;
      if (old_currencies) {
        const new_currencies = update(old_currencies, {$push: [action.currency]})
        return { ...state, currencies: new_currencies };
      } else return state;

    case Constants.CURRENT_ACCOUNTING_CURRENCY_UPDATED:
      old_currencies = state.currencies;
      if (old_currencies) {
        const currency_index = old_currencies.findIndex((goal) => { return goal.id == action.currency.id; });
        const new_currencies = update(old_currencies, {[currency_index]: {$set: action.currency}})
        return { ...state, currencies: new_currencies, editingCurrencyId: null };
      } else return { ...state, editingCurrencyId: null };

    case Constants.CURRENT_ACCOUNTING_CURRENCY_REMOVED:
      old_currencies = state.currencies;
      if (old_currencies) {
        const currency_index = old_currencies.findIndex((goal) => { return goal.id == action.id; });
        const new_currencies = update(old_currencies, {$splice: [[currency_index, 1]]});
        if(state.editingCurrencyId && state.editingCurrencyId == action.id)
          return { ...state, currencies: new_currencies, editingCurrencyId: null };
        else
          return { ...state, currencies: new_currencies };
      } else return state;




    case Constants.CURRENT_ACCOUNTING_EDIT_CATEGORY:
      return { ...state, editingCategoryId: action.id };

    case Constants.CURRENT_ACCOUNTING_CATEGORY_CREATED:
      old_categories = state.categories;
      if (old_categories) {
        const new_categories = update(old_categories, {$push: [action.category]})
        return { ...state, categories: new_categories, categories_tree: action.categories_tree };
      } else return state;

    case Constants.CURRENT_ACCOUNTING_CATEGORY_UPDATED:
      old_categories = state.categories;
      if (old_categories) {
        const category_index = old_categories.findIndex((goal) => { return goal.id == action.category.id; });
        const new_categories = update(old_categories, {[category_index]: {$set: action.category}})
        return { ...state, categories: new_categories, editingCategoryId: null, editingCategoryType: action.category.type, categories_tree: action.categories_tree };
      } else return { ...state, editingCategoryId: null, editingCategoryType: action.category.type };

    case Constants.CURRENT_ACCOUNTING_CATEGORY_REMOVED:
      old_categories = state.categories;
      if (old_categories) {
        const category_index = old_categories.findIndex((goal) => { return goal.id == action.id; });
        const new_categories = update(old_categories, {$splice: [[category_index, 1]]});
        return { ...state, categories: new_categories, categories_tree: action.categories_tree };
      } else return state;

    case Constants.CURRENT_ACCOUNTING_CHANGE_CATEGORY_TYPE:
      return { ...state, editingCategoryType: action.category_type };




    case Constants.CURRENT_ACCOUNTING_MEMBER_ADDED:
      let old_members = state.accounting_users;
      if (old_members) {
        const new_members = update(old_members, {$push: [action.user]})
        return { ...state, accounting_users: new_members, error: null };
      } else return { ...state, error: null };

    case Constants.CURRENT_ACCOUNTING_IMPORT_COMPLETED:
      if(action.data.import_status == "ok")
        return { ...state, imported_count: action.data.inserted_count, error: null };
      else {
        let error_msg;
        error_msg = action.data.error ? action.data.error : action.data.wrong_transactions;
        return { ...state, error: error_msg };
      }

    case Constants.CURRENT_ACCOUNTING_ADD_MEMBER_ERROR:
      return { ...state, error: action.error };


    case Constants.CURRENT_ACCOUNTING_REPORT_FETCHING:
      return { ...state, reports_fetching: true };

    case Constants.CURRENT_ACCOUNTING_REPORT_RECEIVED:
      return { ...state, report_transactions: action.report_transactions,
                         report_tree: action.tree,
                         reports_fetching: false,
                         dynamic_graph: action.dynamic_graph,
                         categories_graph_data: action.categories_graph_data,
                         accounts_graph_data: action.accounts_graph_data };


    case Constants.CURRENT_ACCOUNTING_RESET:
      return initialState;

    default:
      return state;
  }
}
