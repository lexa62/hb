import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';
import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
import MemberForm             from '../../components/accounting/member_form';
import ImportTransactionsForm             from '../../components/accounting/import_transactions_form';

import { Grid, Row, Col, Table } from 'react-bootstrap';

class Participant extends React.Component {
  render() {
    const inserted_at = new Date(this.props.inserted_at);
    const { first_name, last_name, email } = this.props.user;
    return (
      <tr key={this.props.id}>
        <td>
          {this.props.number}
        </td>
        <td>{first_name}</td>
        <td>{last_name}</td>
        <td>{email}</td>
        <td>{inserted_at.toLocaleString()}</td>
      </tr>
    );
  }
}

class AccountingParticipantsView extends React.Component {
  render() {
    const { currentAccounting, dispatch } = this.props;
    const { fetching, channel, accounting_users, error } = currentAccounting;
    let content = null;
    if (!fetching) {
      content = (
        <Grid fluid>
          <Row>
            <Col md={6}>
              <h4>Участники:</h4>
              <Table striped bordered condensed hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Имя</th>
                    <th>Фамилия</th>
                    <th>Email</th>
                    <th>Доступ выдан</th>
                  </tr>
                </thead>
                <tbody>
                {
                  accounting_users.map((user, i) => {
                    return <Participant
                              key={user.id}
                              number={i+1}
                              {...user} />;
                  })
                }
                </tbody>
              </Table>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <h4>Добавление участника</h4>
              <MemberForm dispatch={dispatch} channel={channel} error={error} />
            </Col>
          </Row>
        </Grid>
      );
    }

    return (
      <div>
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

export default connect(mapStateToProps)(AccountingParticipantsView);
