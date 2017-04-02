import Constants              from '../constants';
import { push }               from 'react-router-redux';
import { httpGet, httpPost }  from '../utils';

const Actions = {
  fetchAccounting: () => {
    return dispatch => {
      dispatch({ type: Constants.ACCOUNTING_FETCHING });

      httpGet('/api/v1/accounting')
      .then((data) => {
        dispatch({
          type: Constants.ACCOUNTING_RECEIVED,
          ownedAccounting: data.owned_accounting,
          participatedAccounting: data.participated_acccounting,
        });
      });
    };
  },
};

export default Actions;
