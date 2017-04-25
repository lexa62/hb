import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';
// import {DragDropContext}    from 'react-dnd';
// import HTML5Backend         from 'react-dnd-html5-backend';

import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
// import Select2 from 'react-select2-wrapper';
// import ListForm             from '../../components/lists/form';
import MemberForm             from '../../components/accounting/member_form';
import ImportTransactionsForm             from '../../components/accounting/import_transactions_form';
// import BoardMembers           from '../../components/boards/members';

// @DragDropContext(HTML5Backend)
import { Tabs, Tab } from 'react-bootstrap';

class TransactionRow extends React.Component {
  render() {
    return (
      <li>{`Amount: ${this.props.amount}, description: '${this.props.description}', type: ${this.props.type}, currency: ${this.props.currency.name}`}</li>
    );
  }
}

class TransactionList extends React.Component {
  render() {
    const transactions = this.props.transactions.map((transaction) => {
      return <TransactionRow key={transaction.id} {...transaction} />
    });

    return (
      <ul>
        {transactions}
      </ul>
    );
  }
}

class AccountingForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      type: Constants.EXPENSE,
      amount: '',
      description: '',
      currency_id: props.defaultCurrency.id,
      source_account_id: props.accounts[0] && props.accounts[0].id,
      category_id: props.categories[0] && props.categories[0].id,
      exec_at: ''
    };
  };


  _handleSubmit(e) {
    e.preventDefault();

    const { dispatch, channel, accountingId, defaultCurrency } = this.props;
    let { type, amount, description, currency_id, source_account_id, category_id, exec_at } = this.state;

    // amount = amount.replace(/,/g, '.');

    const data = {
      type: type,
      amount: amount,
      description: description,
      currency_id: currency_id,
      source_account_id: source_account_id,
      category_id: category_id,
      exec_at: exec_at
    };

    dispatch(Actions.createTransaction(channel, data));

    this.setState({
      type: Constants.EXPENSE,
      amount: '',
      description: '',
      currency_id: defaultCurrency.iso_code,
      category_id: '',
      exec_at: ''
    });
  }

  _handleInputChange(event) {
    const target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    switch (name) {
      case 'amount':
        value = value.replace(/[^0-9.]+/g, '');
      default:
      ;
    }

    this.setState({
      [name]: value
    });
  }

  render() {
    return (
      <form onSubmit={::this._handleSubmit}>
        <label>
          Дата:
          <input name="exec_at" type="datetime" value={this.state.exec_at} onChange={::this._handleInputChange} />
        </label>
        <label>
          Категория:
          <select name="category_id" value={this.state.category_id} onChange={::this._handleInputChange}>
            {
              this.props.categories.filter((category) => category.type == this.state.type).map((c) => {
                return (
                  <option key={c.id} value={c.id}>{c.name}</option>
                )
              })
            }
          </select>
        </label>
        <label>
          Счёт:
          <select name="source_account_id" value={this.state.source_account_id} onChange={::this._handleInputChange}>
            {
              this.props.accounts.map((a) => {
                return (
                  <option key={a.id} value={a.id}>{a.name}</option>
                )
              })
            }
          </select>
        </label>
        <label>
          Amount:
          <input name="amount" type="text" value={this.state.amount} onChange={::this._handleInputChange} />
        </label>
        <label>
          Type:
          <select name="type" value={this.state.type} onChange={::this._handleInputChange}>
            <option value={Constants.EXPENSE}>EXPENSE</option>
            <option value={Constants.INCOME}>INCOME</option>
            <option value={Constants.TRANSFER}>TRANSFER</option>
          </select>
        </label>
        <label>
          Currency:
          <select name="currency_id" value={this.state.currency_id} onChange={::this._handleInputChange}>
            {
              this.props.currencies.map((c) => {
                return (
                  <option key={c.id} value={c.id}>{c.name}</option>
                )
              })
            }
          </select>
        </label>
        <label>
          Description:
          <input name="description" type="text" value={this.state.description} onChange={::this._handleInputChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}





class AccountingTransactionsView extends React.Component {
  componentDidMount() {
    // const { socket } = this.props;

    // if (!socket) {
    //   return false;
    // }

    // this.props.dispatch(Actions.connectToChannel(socket, this.props.params.id));
  }

  componentWillUnmount() {
    // const { currentAccounting } = this.props;
    // if (currentAccounting) {
    //   this.props.dispatch(Actions.leaveChannel(currentAccounting.channel));
    // }
  }

  _renderAccounts(accounts) {
    return accounts.map((a) => {
      const content = a.currency_balances.map((c) => {
        return <li key={c.id}>{c.current_amount} {c.currency.name}</li>;
      });
      return (
        <div key={a.id}>
          <span>{a.name}</span>
          <ul>{content}</ul>
        </div>
      )
    })
  }

  _renderTotal(accounts) {
    let result = {};
    accounts.forEach((a) => {
      a.currency_balances.forEach((c) => {
        const amount = parseFloat(c.current_amount)
        if(result[c.currency.name]) result[c.currency.name] += amount;
        else result[c.currency.name] = amount;
      });
    });
    let content = [];
    for(let k in result) {
      content.push(<li key={k}>{result[k]} {k}</li>);
    }
    return (
      <div>
        <h3>Итого:</h3>
        <ul>{content}</ul>
      </div>
    );
  }

  _handleSelect(selectedKey) {
    alert('selected ' + selectedKey);
  }

  render() {
    const { currentAccounting, dispatch } = this.props;
    const { fetching, channel, transactions, id, currencies, categories, accounts, error } = currentAccounting;

    return (
      <div className="well">
        <Tabs bsStyle="pills" defaultActiveKey={1} animation={false} id="noanim-tabs">
          <Tab eventKey={1} title="Расходы">Tab 1 content</Tab>
          <Tab eventKey={2} title="Доходы">Tab 2 content</Tab>
          <Tab eventKey={3} title="Перемещения">Tab 3 content</Tab>
        </Tabs>
        <AccountingForm
          accountingId={id}
          dispatch={dispatch}
          currencies={currencies}
          categories={categories}
          accounts={accounts}
          defaultCurrency={currencies.find(c => c.is_default) || currencies[0]}
          channel={channel} />
        <TransactionList transactions={transactions} />
        <div className="well">
          {::this._renderAccounts(accounts)}
          {::this._renderTotal(accounts)}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccounting: state.currentAccounting,
  socket: state.session.socket,
  currentUser: state.session.currentUser
});

export default connect(mapStateToProps)(AccountingTransactionsView);
