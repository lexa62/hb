import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';
import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
import { Checkbox, Button, Form, FormGroup, ControlLabel, FormControl, ListGroup, ListGroupItem,
         Well, Grid, Col, Row, Nav, NavItem, ButtonToolbar, Table } from 'react-bootstrap';

import DatePicker from "react-bootstrap-date-picker";
class TransactionRow extends React.Component {
  _handleEditClick(e) {
    e.preventDefault();

    const { dispatch, id } = this.props;

    dispatch(Actions.editTransaction(id));
  }

  _handleDeleteClick(e) {
    e.preventDefault();

    const { dispatch, id, channel } = this.props;

    dispatch(Actions.removeTransaction(channel, id));
  }
  render() {
    const { id, amount, type, description } = this.props;
    const updated_at = new Date(this.props.updated_at).toLocaleString();
    let type_name = "";
    switch (this.props.type) {
      case Constants.EXPENSE:
        type_name = "Расход";
        break;
      case Constants.INCOME:
        type_name = "Доход";
        break;
      case Constants.TRANSFER:
        type_name = "Перевод";
        break;
      default:
        type_name = "";
        break;
    }
    return (
      <tr key={this.props.id}>
        <td>{id}</td>
        <td>{amount}</td>
        <td>{type_name}</td>
        <td>{this.props.currency.name}</td>
        <td>{description}</td>
        <td>{this.props.author.email}</td>
        <td>{updated_at}</td>
        <td>
          <a onClick={::this._handleEditClick}><i className="fa fa-pencil-square-o" aria-hidden="true"></i></a>
          {' '}
          <a onClick={::this._handleDeleteClick}><i className="fa fa-trash-o" aria-hidden="true"></i></a>
        </td>
      </tr>
    );
  }
}

class TransactionList extends React.Component {
  render() {
    const { dispatch, channel } = this.props;
    const transactions = this.props.transactions.map((transaction) => {
      return <TransactionRow dispatch={dispatch} channel={channel} key={transaction.id} {...transaction} />
    });

    return (
      <div>
        <h4>Последние операции</h4>
        {
          transactions.length > 0 && (
            <Table striped bordered condensed hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Сумма</th>
                  <th>Тип</th>
                  <th>Валюта</th>
                  <th>Описание</th>
                  <th>Исполнитель</th>
                  <th>Обновлена</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {transactions}
              </tbody>
            </Table>
          )
        }
      </div>
    );
  }
}

class TransactionForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = ::this.getState(props);
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id) {
      this.setState(::this.getState(nextProps));
    }
  }

  getState(props) {
    const defaultCategory = this.props.categories.filter((c) => c.type == props.type)[0];
    const obj = {
      type: props.type,
      amount: props.amount,
      description: props.description,
      currency_id: props.currency_id,
      source_account_id: props.source_account_id,
      destination_account_id: props.destination_account_id,
      category_id: props.category_id || defaultCategory && defaultCategory.id,
      exec_at: props.exec_at
    };
    return obj;
  }

  _handleSubmit(e) {
    e.preventDefault();

    const { dispatch, channel, id, isEdit } = this.props;
    const { type, amount, description, currency_id, source_account_id, destination_account_id, category_id, exec_at } = this.state;
    const destination_account_id_param = type == Constants.TRANSFER ? destination_account_id : null;

    let data = {
      type: type,
      amount: amount,
      description: description,
      currency_id: currency_id,
      source_account_id: source_account_id,
      destination_account_id: destination_account_id_param,
      category_id: category_id,
      exec_at: exec_at
    };

    if(isEdit) {
      data = {...data, id: id }
      dispatch(Actions.updateTransaction(channel, data));
    } else {
      dispatch(Actions.createTransaction(channel, data));
      this.setState(::this.getState(this.props));
    }

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

  _handleExpenseType(e) {
    e.preventDefault();
    const defaultCategory = this.props.categories.filter((c) => c.type == Constants.EXPENSE)[0];
    this.setState({type: Constants.EXPENSE, category_id: defaultCategory && defaultCategory.id});
  }

  _handleIncomeType(e) {
    e.preventDefault();
    const defaultCategory = this.props.categories.filter((c) => c.type == Constants.INCOME)[0];
    this.setState({type: Constants.INCOME, category_id: defaultCategory && defaultCategory.id});
  }

  _handleTransferType(e) {
    e.preventDefault();
    const defaultCategory = this.props.categories.filter((c) => c.type == Constants.TRANSFER)[0];
    this.setState({type: Constants.TRANSFER, category_id: defaultCategory && defaultCategory.id});
  }

  _handleDateChange(value, formattedValue) {
    this.setState({
      exec_at: value
    });
  }

  render() {
    // console.log("STATE", this.state);
    return (
      <div>
        <ButtonToolbar>
          <Button onClick={::this._handleExpenseType} active={this.state.type == Constants.EXPENSE}>Расходы</Button>
          <Button onClick={::this._handleIncomeType} active={this.state.type == Constants.INCOME}>Доходы</Button>
          <Button onClick={::this._handleTransferType} active={this.state.type == Constants.TRANSFER}>Перемещения</Button>
        </ButtonToolbar>
        <br/>
        <Form onSubmit={::this._handleSubmit}>
          <FormGroup>
            <ControlLabel>Дата</ControlLabel>
            <DatePicker id="example-datepicker" required={true} type="text" name="exec_at" value={this.state.exec_at} onChange={::this._handleDateChange} />
          </FormGroup>
          { this.state.type != Constants.TRANSFER && (
              <FormGroup>
                <ControlLabel>Категория</ControlLabel>
                <FormControl componentClass="select" required={true} placeholder="Выберите категорию" name="category_id" value={this.state.category_id} onChange={::this._handleInputChange}>
                  {
                    this.props.categories.filter((c) => c.type == this.state.type).map((c) => {
                      return (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      )
                    })
                  }
                </FormControl>
              </FormGroup>
            )
          }
          {' '}
          <FormGroup>
            <ControlLabel>Счёт</ControlLabel>
            {' '}
            <FormControl componentClass="select" required={true} name="source_account_id" value={this.state.source_account_id} onChange={::this._handleInputChange}>
              <option value=''></option>
              {
                this.props.accounts.map((a) => {
                  return (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  )
                })
              }
            </FormControl>
          </FormGroup>
          { this.state.type == Constants.TRANSFER && (
              <FormGroup>
                <ControlLabel>Счёт-получатель</ControlLabel>
                {' '}
                <FormControl componentClass="select" required={true} name="destination_account_id" value={this.state.destination_account_id} onChange={::this._handleInputChange}>
                  <option value=''></option>
                  {
                    this.props.accounts.map((a) => {
                      if(a.id != this.state.source_account_id)
                      return (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      )
                    })
                  }
                </FormControl>
              </FormGroup>
            )
          }
          {' '}
          <FormGroup>
            <ControlLabel>Сумма</ControlLabel>
            {' '}
            <FormControl name="amount" required={true} type="text" value={this.state.amount} size="8" onChange={::this._handleInputChange} />
          </FormGroup>
          {' '}
          <FormGroup>
            <ControlLabel>Валюта</ControlLabel>
            {' '}
            <FormControl componentClass="select" required={true} name="currency_id" value={this.state.currency_id} onChange={::this._handleInputChange}>
              {
                this.props.currencies.map((c) => {
                  return (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  )
                })
              }
            </FormControl>
          </FormGroup>
          {' '}
          <FormGroup>
            <ControlLabel>Описание</ControlLabel>
            {' '}
            <FormControl name="description" type="text" value={this.state.description} size="8" onChange={::this._handleInputChange} />
          </FormGroup>
          {' '}
          <Button type="submit" bsStyle="primary">
            Применить
          </Button>
        </Form>
      </div>
    );
  }
}





class AccountingTransactionsView extends React.Component {
  _renderAccounts(accounts) {
    return accounts.map((a) => {
      const content = a.currency_balances.sort((a, b) => a.id >= b.id).map((c) => {
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
      a.currency_balances.sort((a, b) => a.id >= b.id).forEach((c) => {
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
        <h4>Итого:</h4>
        <ul>{content}</ul>
      </div>
    );
  }

  render() {
    const { currentAccounting, dispatch } = this.props;
    const { fetching, channel, transactions, id, currencies, categories, accounts, error, editingTransactionId } = currentAccounting;
    let edit_transaction = {};
    const defaultCurrency = currencies.find(c => c.is_default);
    const date = new Date().toISOString();

    if(editingTransactionId) edit_transaction = transactions.find(a => a.id == editingTransactionId)
    // console.log(edit_transaction);

    return (
      <Grid fluid>
        <Row>
          <Col md={6}>
            <Row>
              <Well>
                <h4>Добавить/обновить операцию</h4>
                <TransactionForm
                  id={edit_transaction.id || ''}
                  isEdit={editingTransactionId != undefined}
                  dispatch={dispatch}
                  type={edit_transaction.type || Constants.EXPENSE}
                  amount={edit_transaction.amount || ''}
                  description={edit_transaction.description || ""}
                  currency_id={edit_transaction.currency && edit_transaction.currency.id || (defaultCurrency && defaultCurrency.id)}
                  source_account_id={edit_transaction.source_account_id || ''}
                  destination_account_id={edit_transaction.destination_account_id || ''}
                  category_id={edit_transaction.category_id}
                  exec_at={edit_transaction.exec_at || date}
                  currencies={currencies}
                  categories={categories}
                  accounts={accounts}
                  channel={channel} />
              </Well>
            </Row>
            <Row>
              <Well>
                <TransactionList transactions={transactions} dispatch={dispatch} channel={channel} />
              </Well>
            </Row>
          </Col>
          <Col md={6}>
            <Well>
              <h4>Баланс по счетам</h4>
              {::this._renderAccounts(accounts)}
              {::this._renderTotal(accounts)}
            </Well>
          </Col>
        </Row>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccounting: state.currentAccounting,
  socket: state.session.socket,
  currentUser: state.session.currentUser
});

export default connect(mapStateToProps)(AccountingTransactionsView);
