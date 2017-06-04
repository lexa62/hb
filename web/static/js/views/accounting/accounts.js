import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';

import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
// import Select2 from 'react-select2-wrapper';
import MemberForm             from '../../components/accounting/member_form';
import ImportTransactionsForm             from '../../components/accounting/import_transactions_form';
import update from 'immutability-helper';
import { InputGroup, Checkbox, Button, Form, FormGroup, ControlLabel, FormControl,
         ListGroup, ListGroupItem, Well, Grid, Col, Row, Nav, NavItem } from 'react-bootstrap';

class Account extends React.Component {
  _handleEditClick(e) {
    e.preventDefault();

    const { dispatch, id } = this.props;

    dispatch(Actions.editAccount(id));
  }

  _handleDeleteClick(e) {
    e.preventDefault();

    const { dispatch, id, channel } = this.props;

    dispatch(Actions.removeAccount(channel, id));
  }

  render() {
    const { name, id } = this.props;
    return (
      <ListGroupItem key={id}>
        {name}
        {' '}
        <a onClick={::this._handleEditClick}><i className="fa fa-pencil-square-o" aria-hidden="true"></i></a>
        {' '}
        <a onClick={::this._handleDeleteClick}><i className="fa fa-trash-o" aria-hidden="true"></i></a>
      </ListGroupItem>
    )
  }
}

class AccountForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = ::this.getState(props);
  }

  getState(props) {
    const obj = {
      name: props.name,
      is_default: props.is_default,
      currency_balances: props.currencies.map((c) => {
        let initial_amount = "0";
        let currency_balance = {};
        if(props.currency_balances) {
          currency_balance = props.currency_balances.find(b => b.currency.iso_code == c.iso_code);
          if(currency_balance) initial_amount = currency_balance.initial_amount;
        }
        const obj = { id: (currency_balance && currency_balance.id) || null, currency_id: c.id, iso_code: c.iso_code, initial_amount: initial_amount };
        return obj;
      })
    };
    return obj;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id) {
      this.setState(::this.getState(nextProps));
    }
  }


  _handleCancelEditClick(e) {
    // e.preventDefault();

    // const { dispatch, isEdit } = this.props;

    // if(isEdit) dispatch(Actions.editFinancialGoal(null));
    // else dispatch(Actions.showFinancialGoalForm(false));
  }

  _handleSubmit(e) {
    e.preventDefault();

    const { dispatch, channel, isEdit, id } = this.props;
    const { name, is_default, currency_balances } = this.state;

    let data = {
      name: name,
      is_default: is_default,
      currency_balances: currency_balances
    };

    if(isEdit) {
      data = {...data, id: id }
      dispatch(Actions.updateAccount(channel, data));
    } else {
      dispatch(Actions.addAccount(channel, data));
      this.setState(::this.getState(this.props));
    }
  }

  _handleInputChange(event) {
    const target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    const { currency_balances } = this.state;

    const res = /initial_amount_(.*)/.test(name);
    let obj = { [name]: value };
    if(res) {
      let arr = name.match(/initial_amount_(.*)/);
      const code = arr[arr.length - 1];
      value = value.replace(/[^0-9.]+/g, '');
      // console.log(code);
      const index = currency_balances.findIndex(b => b.iso_code == code);
      const new_currency_balances = update(currency_balances, {[index]: {$set: {id: currency_balances[index].id, currency_id: currency_balances[index].currency_id, iso_code: code, initial_amount: value}}});

      obj = { currency_balances: new_currency_balances };
    }

    // console.log(obj);
    this.setState(obj);
  }

  render() {
    // console.log('PROPS', this.props);
    // console.log('STATE', this.state);
    const { name, id, is_default } = this.props;
    return (
      <Form onSubmit={::this._handleSubmit}>
        <FormGroup>
          <ControlLabel>Название</ControlLabel>
          {' '}
          <FormControl name="name" type="text" required={true} value={this.state.name} size="8" onChange={::this._handleInputChange} />
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>По умолчанию</ControlLabel>
          {' '}
          <Checkbox name="is_default" checked={this.state.is_default} onChange={::this._handleInputChange} />
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>Начальные остатки</ControlLabel>
          {' '}
          {
            this.state.currency_balances.map((c) => {
              // const code = Object.keys(c)[0];
              return (
                <InputGroup key={c.iso_code}>
                  <FormControl type="text" placeholder="0" required={true} size="8" name={`initial_amount_${c.iso_code}`} value={c.initial_amount} onChange={::this._handleInputChange} />
                  <InputGroup.Addon>{c.iso_code}</InputGroup.Addon>
                </InputGroup>
              )
            })
          }
        </FormGroup>
        {' '}
        <Button type="submit" bsStyle="primary">
          Применить
        </Button>
        {' '}
        {/*<a onClick={::this._handleCancelEditClick}>Отмена</a>*/}
      </Form>
    )
  }
}

class AccountingAccountsView extends React.Component {
  render() {
    const { currentAccounting, dispatch } = this.props;
    const { fetching, channel, transactions, id, currencies, categories, accounts, error, editingAccountId } = currentAccounting;
    let content = null;
    let edit_account = {};
    if (!fetching) {

      if(editingAccountId) edit_account = accounts.find(a => a.id == editingAccountId)

      content = (
        <Row>
          <Col md={6}>
            <h4>Счета:</h4>
            <Well>
              <ListGroup>
                {
                  accounts.map((account) => {
                    return (
                      <Account
                        key={account.id}
                        dispatch={dispatch}
                        channel={channel}
                        {...account} />
                    )
                  })
                }
              </ListGroup>
            </Well>
          </Col>

          <Col md={6}>
            <h4>Создать/обновить счёт:</h4>
            <Well>
              <AccountForm
                id={edit_account.id || ''}
                name={edit_account.name || ''}
                is_default={edit_account.is_default || false}
                isEdit={editingAccountId != undefined}
                dispatch={dispatch}
                channel={channel}
                currency_balances={edit_account.currency_balances}
                currencies={currencies} />
            </Well>
          </Col>
        </Row>
      );
    }

    return (
      <Grid fluid>
        {content}
      </Grid>
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccounting: state.currentAccounting,
  socket: state.session.socket,
  currentUser: state.session.currentUser
});

export default connect(mapStateToProps)(AccountingAccountsView);
