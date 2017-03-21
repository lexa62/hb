import { Router }  from 'react-router';
import Constants     from '../constants';
import { httpPost }  from '../utils';

const Actions = {};

Actions.signUp = (data) => {
  return dispatch => {
    httpPost('/api/v1/registrations', {user: data})
    .then((data) => {
      localStorage.setItem('phoenixAuthToken', data.jwt);

      dispatch({
        type: Constants.CURRENT_USER,
        currentUser: data.user,
      });

      Router.push('/');
    })
    .catch((error) => {
      error.response.json()
      .then((errorJSON) => {
        dispatch({
          type: Constants.REGISTRATIONS_ERROR,
          errors: errorJSON.errors,
        });
      });
    });
  };
};

export default Actions;
