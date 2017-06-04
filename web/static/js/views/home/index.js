import React                from 'react';
import { connect }          from 'react-redux';
import classnames           from 'classnames';
import { Link }             from 'react-router';

import { setDocumentTitle } from '../../utils';
import Actions              from '../../actions/sessions';
import { Table, Col, Grid, Row } from 'react-bootstrap';
import { push }           from 'react-router-redux';

class OwnedAccounting extends React.Component {

  render() {
    const inserted_at = new Date(this.props.inserted_at);
    return (
      <tr key={this.props.id}>
        <td>
          <Link to={`/accounting/${this.props.id}`}>
            {this.props.id}
          </Link>
        </td>
        <td>{this.props.transactions_count}</td>
        <td>{inserted_at.toLocaleString()}</td>
      </tr>
    );
  }
}

class ParticipatedAccounting extends React.Component {

  render() {
    const inserted_at = new Date(this.props.inserted_at);
    return (
      <tr key={this.props.id}>
        <td>
          <Link to={`/accounting/${this.props.id}`}>
            {this.props.id}
          </Link>
        </td>
        <td>{this.props.accounting_users.map(e => e.user.email).join(', ')}</td>
        <td>{this.props.transactions_count}</td>
        <td>{inserted_at.toLocaleString()}</td>
      </tr>
    );
  }
}


class HomeIndexView extends React.Component {
  componentDidMount() {
    setDocumentTitle('Аккаунты');
  }

  _renderOwnedAccounting() {
    const { fetching, ownedAccounting } = this.props;
    let content = false;

    const iconClasses = classnames({
      fa: true,
      '': !fetching,
      'fa-spinner': fetching,
      'fa-spin':    fetching,
    });

    if (!fetching) {
      content = (
        <Col md={4}>
          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Количество операций</th>
                <th>Создан</th>
              </tr>
            </thead>
            <tbody>
            {
              ownedAccounting.map((accounting) => {
                return <OwnedAccounting key={accounting.id} dispatch={this.props.dispatch} {...accounting} />;
              })
            }
            </tbody>
          </Table>
        </Col>
      );
    }

    return (
      <Row>
        <header className="view-header">
          <h3><i className={iconClasses}/>Мои аккаунты:</h3>
        </header>
        {content}
      </Row>
    );
  }

  _renderParticipatedAccounting() {
    const { participatedAccounting } = this.props;
    let content = false;

    if (participatedAccounting.length) {
      content = (
        <Row>
          <header className="view-header">
            <h3>Приглашения:</h3>
          </header>
          <Col md={6}>
            <Table striped bordered condensed hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Участники</th>
                  <th>Количество операций</th>
                  <th>Создан</th>
                </tr>
              </thead>
              <tbody>
              {
                participatedAccounting.map((accounting) => {
                  return <ParticipatedAccounting key={accounting.id} dispatch={this.props.dispatch} {...accounting} />;
                })
              }
              </tbody>
            </Table>
          </Col>
        </Row>
      );
    }
    return content;
  }


  render() {
    return (
      <Grid fluid>
        {::this._renderOwnedAccounting()}
        {::this._renderParticipatedAccounting()}
        {/*<a href="#" onClick={::this._handleSignOutClick}><i className="fa fa-sign-out"/> Sign out</a>*/}
      </Grid>
    );
  }

  _handleSignOutClick(e) {
    e.preventDefault();
    this.props.dispatch(Actions.signOut());
  }
}

const mapStateToProps = (state) => (
  state.accounting
);

export default connect(mapStateToProps)(HomeIndexView);
