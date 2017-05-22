import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';
import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
import Datetime         from 'react-datetime';
import { Chart } from 'react-google-charts';
import DatePicker from "react-bootstrap-date-picker";
import { FormGroup, FormControl, ControlLabel, Button, Well, Grid, Col, Row, Form, Table, Checkbox } from 'react-bootstrap';

class TransactionRow extends React.Component {
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
      </tr>
    );
  }
}

class TransactionList extends React.Component {
  render() {
    const transactions = this.props.transactions.map((transaction) => {
      return <TransactionRow key={transaction.id} {...transaction} />
    });

    return (
      <div>
        <h4>Отчёт</h4>
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
            </tr>
          </thead>
          <tbody>
            {transactions}
          </tbody>
        </Table>
        <h4>Итого:</h4>
        <h5>Доходы - {this.props.transactions.reduce((acc, b) => {return acc + (b.type == "income" ? parseFloat(b.amount) : 0 )}, 0).toFixed(2)} BYN</h5>
        <h5>Расходы - {this.props.transactions.reduce((acc, b) => {return acc + (b.type == "expense" ? parseFloat(b.amount) : 0 )}, 0).toFixed(2)} BYN</h5>
      </div>
    );
  }
}

class AccountingReportsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grouped: false,
      options: {
        title: 'Затраты по категориям',
        legend: 'none',
      },
      rows: [
        ["Еда", 12],
        ["Транспорт", 5.5],
        ["Интернет", 7],
      ],
      columns: [
        {
          type: 'string',
          label: 'Категория',
        },
        {
          type: 'number',
          label: 'Затраты',
        },
      ],
    };
  }

  _handleSubmit(e) {
    e.preventDefault();

    const { currentAccounting, dispatch } = this.props;
    // console.log(this.from_date.value);
    // console.log(this.to_date.value);
    this.setState({
      rows: [
        ["Еда", 12],
        ["Транспорт", 20],
        ["Интернет", 7],
      ]
    });

    const data = {
      from: this.from_date.value,
      to: this.to_date.value
    };

    dispatch(Actions.getReport(data, currentAccounting.id));
  }

  render() {
    const { currentAccounting, dispatch } = this.props;
    const { report_transactions } = currentAccounting;

    return (
      <Grid fluid>
        <Row>
          <Col md={6}>
            <Well>
              <h4>Параметры отчёта</h4>
              <Form onSubmit={::this._handleSubmit}>
                <FormGroup>
                  <ControlLabel>С</ControlLabel>
                  <FormControl inputRef={ref => { this.from_date = ref }} name="from-date" type="date" defaultValue="10/10/2010" />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>По</ControlLabel>
                  <FormControl inputRef={ref => { this.to_date = ref }} name="to-date" type="date" />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Счета</ControlLabel>
                  {' '}
                  <FormControl componentClass="select" name="source_account_id" >
                    <option value='all'>Все</option>
                    {
                      this.props.currentAccounting.accounts.map((a) => {
                        return (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        )
                      })
                    }
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Категории</ControlLabel>
                  <FormControl componentClass="select" name="category_id" value={this.state.category_id}>
                    <option value='all'>Все</option>
                    {
                      this.props.currentAccounting.categories.map((c) => {
                        return (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        )
                      })
                    }
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Пересчитать в валюте</ControlLabel>
                  {' '}
                  <FormControl componentClass="select" name="currency_id" >
                    {
                      this.props.currentAccounting.currencies.map((c) => {
                        return (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        )
                      })
                    }
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Пользователь</ControlLabel>
                  {' '}
                  <FormControl componentClass="select"name="author_id" >
                    {
                      this.props.currentAccounting.accounting_users.map((c) => {
                        return (
                          <option key={c.id} value={c.id}>{c.user.email}</option>
                        )
                      })
                    }
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Группировать по категориям</ControlLabel>
                  {' '}
                  <Checkbox name="grouped" inputRef={ref => { this.grouped = ref }} />
                </FormGroup>
                <Button type="submit">
                  Сформировать отчёт
                </Button>
              </Form>
            </Well>
            <Row>
              <Col md={12}>
                {
                  report_transactions.length > 0 && (
                      <Well>
                        <TransactionList transactions={report_transactions} />
                      </Well>
                  )
                }
              </Col>
            </Row>
          </Col>
          <Col md={6}>
            <Well>
              <Chart
                chartType="PieChart"
                rows={this.state.rows}
                columns={this.state.columns}
                options={this.state.options}
                graph_id="ScatterChart"
                width={'100%'}
                height={'400px'}
                legend_toggle
              />
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

export default connect(mapStateToProps)(AccountingReportsView);
