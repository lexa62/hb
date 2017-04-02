import React            from 'react';
import { connect }      from 'react-redux';
import AccountingActions    from '../actions/accounting';
// import Header           from '../layouts/header';

class AuthenticatedContainer extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(AccountingActions.fetchAccounting());
  }

  render() {
    const { currentUser, dispatch, socket, currentBoard } = this.props;

    if (!currentUser) return false;

    return (
      <div id="authentication_container" className="application-container">

        <div className='main-container'>
          {this.props.children}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser: state.session.currentUser,
  socket: state.session.socket,
  channel: state.session.channel,
  accounting: state.accounting,
  currentAccounting: state.currentAccounting,
});

export default connect(mapStateToProps)(AuthenticatedContainer);
