import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';
// import {DragDropContext}    from 'react-dnd';
// import HTML5Backend         from 'react-dnd-html5-backend';

import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
import Datetime         from 'react-datetime';
import { Chart } from 'react-google-charts';
// import Select2 from 'react-select2-wrapper';
// import ListForm             from '../../components/lists/form';
// import BoardMembers           from '../../components/boards/members';

// @DragDropContext(HTML5Backend)
import { FormGroup, FormControl, ControlLabel, Button } from 'react-bootstrap';

class AccountingReportsView extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     options: {
  //       title: 'Age vs. Weight comparison',
  //       legend: 'none',
  //     },
  //     rows: [
  //       ["Еда", 12],
  //       ["Транспорт", 5.5],
  //       ["Интернет", 7],
  //     ],
  //     columns: [
  //       {
  //         type: 'string',
  //         label: 'Категория',
  //       },
  //       {
  //         type: 'number',
  //         label: 'Затраты',
  //       },
  //     ],
  //   };
  // }
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

  _handleSubmit(e) {
    e.preventDefault();

    const { currentAccounting, dispatch } = this.props;
    // console.log(this.from_date.value);
    // console.log(this.to_date.value);
    // this.setState({
    //   rows: [
    //     ["Еда", 12],
    //     ["Транспорт", 20],
    //     ["Интернет", 7],
    //   ]
    // });

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
      <div>
        {JSON.stringify(report_transactions)}
        {/*<Datetime />*/}
        <form onSubmit={::this._handleSubmit}>
          <FormGroup>
            <ControlLabel>С</ControlLabel>
            <FormControl inputRef={ref => { this.from_date = ref }} name="from-date" type="date" />
          </FormGroup>
          <FormGroup>
            <ControlLabel>По</ControlLabel>
            <FormControl inputRef={ref => { this.to_date = ref }} name="to-date" type="date" />
          </FormGroup>
          <Button type="submit">
            Сформировать отчёт
          </Button>
        </form>
        {/*<Chart
          chartType="PieChart"
          rows={this.state.rows}
          columns={this.state.columns}
          options={this.state.options}
          graph_id="ScatterChart"
          width={'100%'}
          height={'400px'}
          legend_toggle
        />*/}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccounting: state.currentAccounting,
  socket: state.session.socket,
  currentUser: state.session.currentUser
});

export default connect(mapStateToProps)(AccountingReportsView);
