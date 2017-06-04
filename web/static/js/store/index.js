import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware }             from 'react-router-redux';
import createLogger                     from 'redux-logger';
import thunkMiddleware                  from 'redux-thunk';
import reducers                         from '../reducers';

export default function configureStore(browserHistory) {
  const reduxRouterMiddleware = routerMiddleware(browserHistory);
  let createStoreWithMiddleware;
  if(process.env.NODE_ENV !== 'production') {
    const loggerMiddleware = createLogger({
      level: 'info',
      collapsed: true,
    });
    createStoreWithMiddleware = applyMiddleware(reduxRouterMiddleware, thunkMiddleware, loggerMiddleware)(createStore);
  } else createStoreWithMiddleware = applyMiddleware(reduxRouterMiddleware, thunkMiddleware)(createStore);
  return createStoreWithMiddleware(reducers);
}
