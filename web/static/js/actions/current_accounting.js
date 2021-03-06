import Constants  from '../constants';
import { httpGet, httpPost, httpPostFile }  from '../utils';

import fileDownload  from 'react-file-download';

const Actions = {
  showError: (payload) => {
    let msg = payload.error;
    if(payload.reasons) msg = `${msg} (${payload.reasons.join(', ')})`;
    alert(msg);
  },
  connectToChannel: (socket, accountingId) => {
    return dispatch => {
      // const channelName = `accounting:${accountingId === 'my' ? ownedId : accountingId}`
      const channelName = `accounting:${accountingId}`
      const channel = socket.channel(channelName);

      dispatch({ type: Constants.CURRENT_ACCOUNTING_FETCHING });

      channel.join().receive('ok', (response) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_SETTED,
          accounting: response.accounting,
        });
      });

      channel.on('transaction:created', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_TRANSACTION_CREATED,
          transaction: msg.transaction,
          currency_balances: msg.currency_balances
        });
      });

      channel.on('transaction:updated', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_TRANSACTION_UPDATED,
          transaction: msg.transaction,
          currency_balances: msg.currency_balances
        });
      });

      channel.on('transaction:removed', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_TRANSACTION_REMOVED,
          id: msg.transaction_id,
          currency_balances: msg.currency_balances
        });
      });

      channel.on('member:added', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_MEMBER_ADDED,
          user: msg.user,
        });
      });

      channel.on('financial_goal:updated', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_FINANCIAL_GOAL_UPDATED,
          financial_goal: msg.financial_goal,
        });
      });

      channel.on('financial_goal:created', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_FINANCIAL_GOAL_CREATED,
          financial_goal: msg.financial_goal,
        });
      });

      channel.on('financial_goal:removed', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_FINANCIAL_GOAL_REMOVED,
          id: msg.financial_goal_id,
        });
      });



      channel.on('account:updated', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_ACCOUNT_UPDATED,
          account: msg.account,
        });
      });

      channel.on('account:created', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_ACCOUNT_CREATED,
          account: msg.account,
        });
      });

      channel.on('account:removed', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_ACCOUNT_REMOVED,
          id: msg.account_id,
        });
      });



      channel.on('currency:updated', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_CURRENCY_UPDATED,
          currency: msg.currency,
        });
      });

      channel.on('currency:created', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_CURRENCY_CREATED,
          currency: msg.currency,
        });
      });

      channel.on('currency:removed', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_CURRENCY_REMOVED,
          id: msg.currency_id,
        });
      });




      channel.on('category:updated', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_CATEGORY_UPDATED,
          category: msg.category,
          categories_tree: msg.categories_tree,
        });
      });

      channel.on('category:created', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_CATEGORY_CREATED,
          category: msg.category,
          categories_tree: msg.categories_tree,
        });
      });

      channel.on('category:removed', (msg) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_CATEGORY_REMOVED,
          id: msg.category_id,
          categories_tree: msg.categories_tree,
        });
      });



      dispatch({
        type: Constants.CURRENT_ACCOUNTING_CONNECTED_TO_CHANNEL,
        channel: channel,
      });
    };
  },

  leaveChannel: (channel) => {
    return dispatch => {
      channel.leave();

      dispatch({
        type: Constants.CURRENT_ACCOUNTING_RESET,
      });
    };
  },

  createTransaction: (channel, data) => {
    return dispatch => {
      channel.push('transactions:create', { transaction: data })
        .receive("error", Actions.showError);
    };
  },

  editTransaction: (id) => {
    return dispatch => {
      dispatch({
        type: Constants.CURRENT_ACCOUNTING_EDIT_TRANSACTION,
        id: id,
      });
    };
  },

  updateTransaction: (channel, transaction) => {
    return dispatch => {
      channel.push('transaction:update', { transaction: transaction })
        .receive("error", Actions.showError);
    };
  },

  removeTransaction: (channel, id) => {
    return dispatch => {
      channel.push('transaction:remove', { transaction_id: id })
        .receive("error", Actions.showError);
    };
  },



  exportTransactions: (accounting_id) => {
    httpGet(`/api/v1/accounting/${accounting_id}/transactions/export`)
    .then((data) => {
      fileDownload(data.content, 'export.csv');
    });
  },

  importTransactions: (accounting_id, data) => {
    return dispatch => {
      httpPostFile(`/api/v1/accounting/${accounting_id}/transactions/import`, data)
      .then((data) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_IMPORT_COMPLETED,
          data: data.result,
        });
      });
    }
  },

  addNewMember: (channel, email) => {
    return dispatch => {
      channel.push('members:add', { email: email })
      .receive('error', (data) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_ADD_MEMBER_ERROR,
          error: data.error,
        });
      });
    };
  },

  fetchFinancialGoals: (accounting_id) => {
    return dispatch => {
      dispatch({ type: Constants.CURRENT_ACCOUNTING_FINANCIAL_GOALS_FETCHING });

      httpGet(`/api/v1/accounting/${accounting_id}/financial_goals`)
      .then((data) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_FINANCIAL_GOALS_RECEIVED,
          financial_goals: data.financial_goals
        });
      });
    };
  },

  showFinancialGoalForm: (show) => {
    return dispatch => {
      dispatch({
        type: Constants.CURRENT_ACCOUNTING_SHOW_FINANCIAL_GOAL_FORM,
        show: show
      });
    };
  },

  editFinancialGoal: (id) => {
    return dispatch => {
      dispatch({
        type: Constants.CURRENT_ACCOUNTING_EDIT_FINANCIAL_GOAL,
        id: id,
      });
    };
  },

  addFinancialGoal: (channel, financial_goal) => {
    return dispatch => {
      channel.push('financial_goal:add', { financial_goal: financial_goal })
        .receive("error", Actions.showError);
    };
  },


  updateFinancialGoal: (channel, financial_goal) => {
    return dispatch => {
      channel.push('financial_goal:update', { financial_goal: financial_goal })
        .receive("error", Actions.showError);
    };
  },

  removeFinancialGoal: (channel, id) => {
    return dispatch => {
      channel.push('financial_goal:remove', { financial_goal_id: id })
        .receive("error", Actions.showError);
    };
  },

  getReport: (data, accounting_id) => {
    return dispatch => {
      dispatch({ type: Constants.CURRENT_ACCOUNTING_REPORT_FETCHING });

      httpGet(`/api/v1/accounting/${accounting_id}/report?from=${data.from}&to=${data.to}&currency=${data.currency_code}&grouped=${data.grouped}&author=${data.author_id}${data.source_account_id == 'all' ? '' : '&account=' + data.source_account_id}${data.category_id == 'all' ? '' : '&category=' + data.category_id}`)
      .then((data) => {
        dispatch({
          type: Constants.CURRENT_ACCOUNTING_REPORT_RECEIVED,
          report_transactions: data.transactions,
          tree: data.tree,
          dynamic_graph: data.dynamic_graph,
          categories_graph_data: data.categories_graph_data,
          accounts_graph_data: data.accounts_graph_data
        });
      });
    };
  },



  editAccount: (id) => {
    return dispatch => {
      dispatch({
        type: Constants.CURRENT_ACCOUNTING_EDIT_ACCOUNT,
        id: id,
      });
    };
  },

  addAccount: (channel, account) => {
    return dispatch => {
      channel.push('account:add', { account: account })
        .receive("error", Actions.showError);
    };
  },


  updateAccount: (channel, account) => {
    return dispatch => {
      channel.push('account:update', { account: account })
        .receive("error", Actions.showError);
    };
  },

  removeAccount: (channel, id) => {
    return dispatch => {
      channel.push('account:remove', { account_id: id })
        .receive("error", Actions.showError);
    };
  },



  editCurrency: (id) => {
    return dispatch => {
      dispatch({
        type: Constants.CURRENT_ACCOUNTING_EDIT_CURRENCY,
        id: id,
      });
    };
  },

  addCurrency: (channel, currency) => {
    return dispatch => {
      channel.push('currency:add', { currency: currency })
        .receive("error", Actions.showError);
    };
  },


  updateCurrency: (channel, currency) => {
    return dispatch => {
      channel.push('currency:update', { currency: currency })
        .receive("error", Actions.showError);
    };
  },

  removeCurrency: (channel, id) => {
    return dispatch => {
      channel.push('currency:remove', { currency_id: id })
        .receive("error", Actions.showError);
    };
  },



  editCategory: (id) => {
    return dispatch => {
      dispatch({
        type: Constants.CURRENT_ACCOUNTING_EDIT_CATEGORY,
        id: id,
      });
    };
  },

  changeCategoryType: (category_type) => {
    return dispatch => {
      dispatch({
        type: Constants.CURRENT_ACCOUNTING_CHANGE_CATEGORY_TYPE,
        category_type: category_type,
      });
    };
  },

  addCategory: (channel, category) => {
    return dispatch => {
      channel.push('category:add', { category: category })
        .receive("error", Actions.showError);
    };
  },


  updateCategory: (channel, category) => {
    return dispatch => {
      channel.push('category:update', { category: category })
        .receive("error", Actions.showError);
    };
  },

  removeCategory: (channel, id) => {
    return dispatch => {
      channel.push('category:remove', { category_id: id })
        .receive("error", Actions.showError);
    };
  },

};

export default Actions;
