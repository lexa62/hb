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
import { Nav, NavItem } from 'react-bootstrap';

class AccountingSettingsView extends React.Component {
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

  _exportTransactions(e) {
    e.preventDefault();

    Actions.exportTransactions(this.props.currentAccounting.id);
  }

  render() {
    const { currentAccounting, dispatch } = this.props;
    const { fetching, channel, transactions, id, currencies, categories, accounts, error } = currentAccounting;
    let content = null;
    if (!fetching) {
      content = (
        <div>
          <MemberForm dispatch={dispatch} channel={channel} error={error} />
          <a href="" onClick={::this._exportTransactions}>Export transactions</a>
          <ImportTransactionsForm accountingId={id} />
        </div>
      );
    }

    return (
      <div className="well">
        <p>fetching: {fetching ? 'Y' : 'N'}</p>
        {content}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccounting: state.currentAccounting,
  socket: state.session.socket,
  currentUser: state.session.currentUser
});

export default connect(mapStateToProps)(AccountingSettingsView);
