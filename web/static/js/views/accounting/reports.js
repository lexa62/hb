import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';
import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
import Datetime         from 'react-datetime';
import { Chart } from 'react-google-charts';
import DatePicker from "react-bootstrap-date-picker";
import { FormGroup, FormControl, ControlLabel, Button, Well, Grid, Col, Row, Form, Table, Checkbox } from 'react-bootstrap';
import classnames           from 'classnames';

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
      <tr key={id}>
        <td>{id}</td>
        <td>{amount}</td>
        <td>{type_name}</td>
        <td>{this.props.currency.name}</td>
        <td>{this.props.author.email}</td>
        <td>{updated_at}</td>
      </tr>
    );
  }
}

class TransactionList extends React.Component {
  render() {
    const { code } = this.props;
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
              <th>Исходная валюта</th>
              <th>Исполнитель</th>
              <th>Обновлена</th>
            </tr>
          </thead>
          <tbody>
            {transactions}
          </tbody>
        </Table>
        <h4>Итого:</h4>
        <h5>Доходы - {this.props.transactions.reduce((acc, b) => {return acc + (b.type == "income" ? parseFloat(b.amount) : 0 )}, 0).toFixed(2)} {code}</h5>
        <h5>Расходы - {this.props.transactions.reduce((acc, b) => {return acc + (b.type == "expense" ? parseFloat(b.amount) : 0 )}, 0).toFixed(2)} {code}</h5>
      </div>
    );
  }
}

class AccountingReportsView extends React.Component {
  constructor(props) {
    super(props);
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    this.state = {
      from_date: date.toISOString(),
      source_account_id: 'all',
      category_id: 'all',
      to_date: new Date(year + 1, month, day).toISOString(),
      currency_code: props.currentAccounting.currencies[0] && props.currentAccounting.currencies[0].iso_code,
      grouped: true,
      author_id: props.currentAccounting.accounting_users[0] && props.currentAccounting.accounting_users[0].user.id
    };
  }

  _handleSubmit(e) {
    e.preventDefault();

    const { currentAccounting, dispatch } = this.props;
    // this.setState({
    //   rows: [
    //     ["Еда", 12],
    //     ["Транспорт", 20],
    //     ["Интернет", 7],
    //   ]
    // });

    const data = {
      from: this.state.from_date,
      to: this.state.to_date,
      currency_code: this.state.currency_code,
      source_account_id: this.state.source_account_id,
      author_id: this.state.author_id,
      category_id: this.state.category_id,
      grouped: this.state.grouped
    };

    dispatch(Actions.getReport(data, currentAccounting.id));
  }

  _handleFromDateChange(value, formattedValue) {
    this.setState({
      from_date: value
    });
  }

  _handleToDateChange(value, formattedValue) {
    this.setState({
      to_date: value
    });
  }

  _handleInputChange(event) {
    const target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  render() {
    const { currentAccounting, dispatch } = this.props;
    const { report_transactions, reports_fetching, dynamic_graph, categories_graph_data, accounts_graph_data } = currentAccounting;
    const iconClasses = classnames({
      fa: true,
      '': !reports_fetching,
      'fa-spinner': reports_fetching,
      'fa-spin':    reports_fetching,
    });
    let combo_array = null;
    if(dynamic_graph) {
      combo_array = [["Месяц","Доходы","Затраты"]];
      let tmp_array = [];
      for (let k of Object.keys(dynamic_graph)) {
        const section = dynamic_graph[k];
        tmp_array.push([k, parseFloat(section.income), parseFloat(section.expense)]);
      }
      combo_array = combo_array.concat(tmp_array.sort((a, b) => a[0] >= b[0]));
    }
    // console.log("STATE", this.state);

    return (
      <Grid fluid>
        <Row>
          <Col md={4}>
            <Well>
              <h4>Параметры отчёта</h4>
              <Form onSubmit={::this._handleSubmit}>
                <FormGroup>
                  <ControlLabel>С</ControlLabel>
                  <DatePicker id="example-datepicker" required={true} type="text" name="from_date" value={this.state.from_date} onChange={::this._handleFromDateChange} />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>По</ControlLabel>
                  <DatePicker id="example-datepicker" required={true} type="text" name="to_date" value={this.state.to_date} onChange={::this._handleToDateChange} />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Счета</ControlLabel>
                  {' '}
                  <FormControl componentClass="select" name="source_account_id" value={this.state.source_account_id} onChange={::this._handleInputChange} >
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
                  <FormControl componentClass="select" name="category_id" value={this.state.category_id} onChange={::this._handleInputChange}>
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
                  <FormControl componentClass="select" required={true} name="currency_code" value={this.state.currency_code} onChange={::this._handleInputChange} >
                    {
                      this.props.currentAccounting.currencies.map((c) => {
                        return (
                          <option key={c.id} value={c.iso_code}>{c.name}</option>
                        )
                      })
                    }
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Пользователь</ControlLabel>
                  {' '}
                  <FormControl componentClass="select"name="author_id" value={this.state.author_id} onChange={::this._handleInputChange} >
                    {
                      this.props.currentAccounting.accounting_users.map((c) => {
                        return (
                          <option key={c.user.id} value={c.user.id}>{c.user.email}</option>
                        )
                      })
                    }
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Группировать по категориям</ControlLabel>
                  {' '}
                  <Checkbox name="grouped" checked={this.state.grouped} onChange={::this._handleInputChange} />
                </FormGroup>
                <Button type="submit">
                  {"Сформировать отчёт "}
                  <i className={iconClasses}/>
                </Button>
              </Form>
            </Well>
            <Row>
              <Col md={12}>
                {
                  report_transactions.length > 0 && (
                      <Well>
                        <TransactionList transactions={report_transactions} code={this.state.currency_code} />
                      </Well>
                  )
                }
              </Col>
            </Row>
          </Col>
          {
            categories_graph_data && categories_graph_data.expense.length > 0 && (
              <Col md={4}>
                <Well>
                  <Chart
                    chartType="PieChart"
                    rows={categories_graph_data.expense.map(arr => [arr[0], parseFloat(arr[1])])}
                    columns={[{type: 'string', label: 'Категория'},{type: 'number', label: 'Затраты'}]}
                    options={{title: 'Затраты по категориям за период', is3D: true}}
                    graph_id="PieChart"
                    width={'100%'}
                  />
                </Well>
              </Col>
            )
          }
          {
            dynamic_graph && combo_array && combo_array.length > 1 && (
              <Col md={4}>
                <Well>
                  <Chart
                    chartType="ComboChart"
                    data={combo_array}
                    options={{"title":"Общая динамика затрат и доходов","vAxis":{"title":"Сумма"},"hAxis":{"title":"Месяц"},"seriesType":"bars","series":{"5":{"type":"line"}}}}
                    graph_id="ComboChart"
                    width={'100%'}
                  />
                </Well>
              </Col>
            )
          }
          {
            categories_graph_data && categories_graph_data.income.length > 0 && (
              <Col md={4}>
                <Well>
                  <Chart
                    chartType="PieChart"
                    rows={categories_graph_data.income.map(arr => [arr[0], parseFloat(arr[1])])}
                    columns={[{type: 'string', label: 'Категория'},{type: 'number', label: 'Доходы'}]}
                    options={{title: 'Доходы по категориям за период', is3D: true}}
                    graph_id="PieChart2"
                    width={'100%'}
                  />
                </Well>
              </Col>
            )
          }
          {
            accounts_graph_data && accounts_graph_data.length > 0 && (
              <Col md={4}>
                <Well>
                  <Chart
                    chartType="BarChart"
                    rows={accounts_graph_data.map(arr => [arr[0], parseFloat(arr[1])])}
                    columns={[{type: 'string', label: 'Счёт'},{type: 'number', label: 'Доходы'}]}
                    options={{title: 'Пополнения по счетам за период', legend:{position:"none"}}}
                    graph_id="BarChart"
                    width={'100%'}
                  />
                </Well>
              </Col>
            )
          }
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
