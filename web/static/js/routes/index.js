import { IndexRoute, Route }        from 'react-router';
import React                        from 'react';
import MainLayout                   from '../layouts/main';
import AuthenticatedContainer       from '../containers/authenticated';
import HomeIndexView                from '../views/home';
import RegistrationsNew             from '../views/registrations/new';
import SessionsNew                  from '../views/sessions/new';
import AccountingShowView               from '../views/accounting/show';
import AccountingTransactionsView   from '../views/accounting/transactions';

import AccountingParticipantsView       from '../views/accounting/participants';
import AccountingExportImportView       from '../views/accounting/export_import';
import AccountingAccountsView       from '../views/accounting/accounts';
import AccountingCurrenciesView     from '../views/accounting/currencies';
import AccountingExpenseCategoriesView     from '../views/accounting/expense_categories';
import AccountingIncomeCategoriesView     from '../views/accounting/income_categories';

import AccountingFinancialGoalsView from '../views/accounting/financial_goals';
import AccountingReportsView from '../views/accounting/reports';
// import CardsShowView                from '../views/cards/show';
import Actions                      from '../actions/sessions';

export default function configRoutes(store) {
  const _ensureAuthenticated = (nextState, replace, callback) => {
    const { dispatch } = store;
    const { session } = store.getState();
    const { currentUser } = session;

    if (!currentUser && localStorage.getItem('phoenixAuthToken')) {
      dispatch(Actions.currentUser());
    } else if (!localStorage.getItem('phoenixAuthToken')) {
      replace('/sign_in');
    }

    callback();
  };

  return (
    <Route component={MainLayout}>
      <Route path="/sign_up" component={RegistrationsNew} />
      <Route path="/sign_in" component={SessionsNew} />

      <Route path="/" component={AuthenticatedContainer} onEnter={_ensureAuthenticated}>
        <IndexRoute component={HomeIndexView} />

        <Route path="/accounting/:id" component={AccountingShowView}>
          <IndexRoute component={AccountingTransactionsView} />
          <Route path="financial_goals" component={AccountingFinancialGoalsView} />
          <Route path="reports" component={AccountingReportsView} />

          <Route path="expense_categories" component={AccountingExpenseCategoriesView} />
          <Route path="income_categories" component={AccountingIncomeCategoriesView} />
          <Route path="participants" component={AccountingParticipantsView} />
          <Route path="export_import" component={AccountingExportImportView} />
          <Route path="accounts" component={AccountingAccountsView} />
          <Route path="currencies" component={AccountingCurrenciesView} />
        </Route>
      </Route>
    </Route>
  );
}

