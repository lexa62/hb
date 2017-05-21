import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';

import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
import update from 'immutability-helper';
import { Checkbox, Button, Form, FormGroup, ControlLabel, FormControl, ListGroup, ListGroupItem,
         Well, Grid, Col, Row, Nav, NavItem } from 'react-bootstrap';

class Currency extends React.Component {
  _handleEditClick(e) {
    e.preventDefault();

    const { dispatch, id } = this.props;

    dispatch(Actions.editCurrency(id));
  }

  _handleDeleteClick(e) {
    e.preventDefault();

    const { dispatch, id, channel } = this.props;

    dispatch(Actions.removeCurrency(channel, id));
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

class CurrencyForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = ::this.getState(props);
  }

  getState(props) {
    const obj = {
      name: props.name,
      is_default: props.is_default,
      manual_rate: props.manual_rate,
      is_auto: props.manual_rate == undefined,
      iso_code: props.iso_code
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
    const { name, is_default, iso_code, is_auto, manual_rate } = this.state;
    const manual_rate_param = is_auto || is_default ? null : manual_rate;

    let data = {
      name: name,
      is_default: is_default,
      manual_rate: manual_rate_param,
      iso_code: iso_code
    };

    console.log(data);
    console.log(manual_rate);

    if(isEdit) {
      data = {...data, id: id }
      dispatch(Actions.updateCurrency(channel, data));
    } else {
      dispatch(Actions.addCurrency(channel, data));
      this.setState(::this.getState(this.props));
    }
  }

  _handleInputChange(event) {
    const target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    switch (name) {
      case 'manual_rate':
        value = value.replace(/[^0-9.]+/g, '');
      default:
      ;
    }

    this.setState({
      [name]: value
    });

  }

  render() {
    // console.log('PROPS', this.props);
    console.log('STATE', this.state);
    const { name, id, is_default } = this.props;
    return (
      <Form onSubmit={::this._handleSubmit}>
        <FormGroup>
          <ControlLabel>Название</ControlLabel>
          {' '}
          <FormControl name="name" type="text" value={this.state.name} size="8" onChange={::this._handleInputChange} />
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>Код валюты</ControlLabel>
          {' '}
          <FormControl name="iso_code" type="text" placeholder="BYN" value={this.state.iso_code} size="8" onChange={::this._handleInputChange} />
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>Использовать автоматический курс</ControlLabel>
          {' '}
          <Checkbox name="is_auto" checked={this.state.is_auto} onChange={::this._handleInputChange} />
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>Курс к основной валюте</ControlLabel>
          {' '}
          <FormControl name="manual_rate" type="text" readOnly={this.state.is_auto || this.state.is_default} placeholder="1.9" value={this.state.manual_rate} size="8" onChange={::this._handleInputChange} />
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>По умолчанию</ControlLabel>
          {' '}
          <Checkbox name="is_default" checked={this.state.is_default} onChange={::this._handleInputChange} />
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

class AccountingIncomeCategoriesView extends React.Component {
  render() {
    const { currentAccounting, dispatch } = this.props;
    const { fetching, channel, transactions, id, currencies, categories, error, editingCurrencyId } = currentAccounting;
    let content = null;
    let edit_currency = {};
    if (!fetching) {

      if(editingCurrencyId) edit_currency = currencies.find(a => a.id == editingCurrencyId)
      console.log(edit_currency);

      content = (
        <Row>
          <Col md={6}>
            <h4>Валюты:</h4>
            <Well>
              <ListGroup>
                {
                  currencies.map((currency) => {
                    return (
                      <Currency
                        key={currency.id}
                        dispatch={dispatch}
                        channel={channel}
                        {...currency} />
                    )
                  })
                }
              </ListGroup>
            </Well>
          </Col>

          <Col md={6}>
            <h4>Создать/обновить валюту:</h4>
            <Well>
              <CurrencyForm
                id={edit_currency.id || ''}
                name={edit_currency.name || ''}
                iso_code={edit_currency.iso_code || ''}
                manual_rate={edit_currency.manual_rate || ''}
                is_default={edit_currency.is_default || false}
                isEdit={editingCurrencyId != undefined}
                dispatch={dispatch}
                channel={channel} />
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

export default connect(mapStateToProps)(AccountingIncomeCategoriesView);
