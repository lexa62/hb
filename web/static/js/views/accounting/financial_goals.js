import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';
import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
import { Grid, Row, Col, Panel, ListGroup, ListGroupItem, ProgressBar, Form, FormGroup,
        ControlLabel, FormControl, Button } from 'react-bootstrap';

class FinancialGoalForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: props.name,
      current_amount: props.current_amount,
      goal_amount: props.goal_amount,
      currency_id: props.currency != undefined ? props.currency.id : props.currencies[0] && props.currencies[0].id
    };
  }

  _handleCancelEditClick(e) {
    e.preventDefault();

    const { dispatch, isEdit } = this.props;

    if(isEdit) dispatch(Actions.editFinancialGoal(null));
    else dispatch(Actions.showFinancialGoalForm(false));
  }

  _handleSubmit(e) {
    e.preventDefault();

    const { dispatch, channel, isEdit, id } = this.props;
    const { name, current_amount, goal_amount, currency_id } = this.state;

    let data = {
      name: name,
      current_amount: current_amount.toString(),
      goal_amount: goal_amount.toString(),
      currency_id: currency_id,
    };

    if(isEdit) {
      data = {...data, id: id }
      dispatch(Actions.updateFinancialGoal(channel, data));
    } else {
      dispatch(Actions.addFinancialGoal(channel, data));
    }
  }

  _handleInputChange(event) {
    const target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    switch (name) {
      case 'current_amount':
      case 'goal_amount':
        value = value.replace(/[^0-9.]+/g, '');
      default:
      ;
    }

    this.setState({
      [name]: value
    });

  }

  render() {
    const { current_amount, goal_amount, name, id, isEdit, currencies } = this.props;
    return (
      <Form inline onSubmit={::this._handleSubmit} className="financial-goals-form">
        <FormGroup>
          <ControlLabel>Название</ControlLabel>
          {' '}
          <FormControl name="name" type="text" required={true} value={this.state.name} size="8" onChange={::this._handleInputChange} />
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>Накоплено</ControlLabel>
          {' '}
          <FormControl type="text" placeholder="100" required={true} size="8" name="current_amount" value={this.state.current_amount} onChange={::this._handleInputChange} />
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>Сумма</ControlLabel>
          {' '}
          <FormControl type="text" placeholder="1000" required={true} size="8" name="goal_amount" value={this.state.goal_amount} onChange={::this._handleInputChange} />
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>Валюта</ControlLabel>
          {' '}
          <FormControl componentClass="select" required={true} name="currency_id" value={this.state.currency_id} onChange={::this._handleInputChange}>
            {
              currencies.map((c) => {
                return (
                  <option key={c.id} value={c.id}>{c.name}</option>
                )
              })
            }
          </FormControl>
        </FormGroup>
        {' '}
        <Button type="submit" bsStyle="primary">
          Применить
        </Button>
        {' '}
        <a onClick={::this._handleCancelEditClick}>Отмена</a>
      </Form>
    )
  }
}

class FinancialGoal extends React.Component {
  _handleEditClick(e) {
    e.preventDefault();

    const { dispatch, id } = this.props;

    dispatch(Actions.editFinancialGoal(id));
  }

  _handleDeleteClick(e) {
    e.preventDefault();

    const { dispatch, id, channel } = this.props;

    dispatch(Actions.removeFinancialGoal(channel, id));
  }

  render() {
    const { name, id, isEdit, currencies, dispatch, channel, currency } = this.props;
    const current_amount = parseFloat(this.props.current_amount);
    const goal_amount = parseFloat(this.props.goal_amount);
    if(!isEdit) {
      return (
        <ListGroupItem key={id}>
          {name}
          <br/>
          <ProgressBar now={100*current_amount/goal_amount} label={`${current_amount}/${goal_amount} ${currency.name}`} />
          <a onClick={::this._handleEditClick}>Обновить</a>
          {' '}
          <a onClick={::this._handleDeleteClick}>Удалить</a>
        </ListGroupItem>
      )
    } else return(
      <FinancialGoalForm
        id={id}
        name={name}
        isEdit={true}
        dispatch={dispatch}
        channel={channel}
        current_amount={current_amount}
        goal_amount={goal_amount}
        currency={currency}
        currencies={currencies} />
    )
  }
}

class AccountingFinancialGoalsView extends React.Component {
  componentDidMount() {
    const { dispatch, currentAccounting } = this.props;
    if (!currentAccounting.fetching_financial_goals) {
      return false;
    }
    dispatch(Actions.fetchFinancialGoals(currentAccounting.id));
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

  _handleAddClick(e) {
    e.preventDefault();

    const { dispatch } = this.props;

    dispatch(Actions.showFinancialGoalForm(true));
  }

  render() {
    let content = null;
    const { financial_goals, fetching_financial_goals, editingFinancialGoalId, currencies, channel, showFinancialGoalForm } = this.props.currentAccounting;
    const { dispatch } = this.props;
    if (!fetching_financial_goals) {
      content = (
        <Panel bsStyle="info" header="Финансовые цели/накопления">
          <ListGroup fill>
            {
              financial_goals.map((goal) => {
                return (
                  <FinancialGoal
                    key={goal.id}
                    dispatch={dispatch}
                    channel={channel}
                    isEdit={editingFinancialGoalId == goal.id}
                    currencies={currencies}
                    {...goal} />
                )
              })
            }
            {
              showFinancialGoalForm &&
                <FinancialGoalForm
                  id={''}
                  name={''}
                  isEdit={false}
                  current_amount={''}
                  goal_amount={''}
                  dispatch={dispatch}
                  channel={channel}
                  currencies={currencies} />
            }
          </ListGroup>
          {
              !showFinancialGoalForm &&
                <a onClick={::this._handleAddClick}>Добавить</a>
          }
        </Panel>
      );
    }
    return content;
  }
}

const mapStateToProps = (state) => ({
  currentAccounting: state.currentAccounting,
  socket: state.session.socket,
  currentUser: state.session.currentUser
});

export default connect(mapStateToProps)(AccountingFinancialGoalsView);
