import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';
import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
import ImportTransactionsForm             from '../../components/accounting/import_transactions_form';
import { Grid, Button, Row, Col, Alert } from 'react-bootstrap';

class AccountingExportImportView extends React.Component {
  _exportTransactions(e) {
    e.preventDefault();

    Actions.exportTransactions(this.props.currentAccounting.id);
  }

  render() {
    const { currentAccounting, dispatch } = this.props;
    const { fetching, channel, transactions, id, currencies, categories, accounts, error, imported_count } = currentAccounting;
    let content = null;
    if (!fetching) {
      content = (
        <Grid fluid>
          <Row>
             <Col md={6}>
              <Button bsStyle="default" onClick={::this._exportTransactions}>
                Экспортировать все операции ({transactions.length})
              </Button>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <ImportTransactionsForm dispatch={dispatch} accountingId={id} />
              { imported_count != undefined && <p>Импортировано {imported_count} операций</p> }
            </Col>
          </Row>
        </Grid>
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

export default connect(mapStateToProps)(AccountingExportImportView);
