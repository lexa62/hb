import { push }                           from 'react-router-redux';
import Constants                          from '../constants';
import { Socket }                         from 'phoenix';
import { httpGet, httpPost, httpDelete }  from '../utils';

export function setCurrentUser(dispatch, user) {
  let socket;
  if(process.env.NODE_ENV !== 'production') {
    socket = new Socket('/socket', {
      params: { token: localStorage.getItem('phoenixAuthToken') },
      logger: (kind, msg, data) => { console.log('WEBSOCKET_LOGGER:', `${kind}: ${msg}`, data); },
    });
  } else {
    socket = new Socket('/socket', {
      params: { token: localStorage.getItem('phoenixAuthToken') }
    });
  }

  socket.connect();

  dispatch({
    type: Constants.CURRENT_USER,
    currentUser: user,
    socket: socket
  });
};

const Actions = {
  signIn: (email, password) => {
    return dispatch => {
      const data = {
        session: {
          email: email,
          password: password,
        },
      };

      httpPost('/api/v1/sessions', data)
      .then((data) => {
        localStorage.setItem('phoenixAuthToken', data.jwt);
        setCurrentUser(dispatch, data.user);
        dispatch(push('/'));
      })
      .catch((error) => {
        error.response.json()
        .then((errorJSON) => {
          dispatch({
            type: Constants.SESSIONS_ERROR,
            error: errorJSON.error,
          });
        });
      });
    };
  },

  currentUser: () => {
    return dispatch => {
      const authToken = localStorage.getItem('phoenixAuthToken');

      httpGet('/api/v1/current_user')
      .then(function (data) {
        setCurrentUser(dispatch, data);
      })
      .catch(function (error) {
        console.log(error);
        dispatch(push('/sign_in'));
      });
    };
  },

  signOut: () => {
    return dispatch => {
      httpDelete('/api/v1/sessions')
      .then((data) => {
        localStorage.removeItem('phoenixAuthToken');

        dispatch({ type: Constants.USER_SIGNED_OUT, });

        dispatch(push('/sign_in'));

      })
      .catch(function (error) {
        console.log(error);
      });
    };
  },
};

export default Actions;
