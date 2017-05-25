import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';
import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
import classnames           from 'classnames';

class AccountingShowView extends React.Component {
  componentDidMount() {
    const { socket } = this.props;

    if (!socket) {
      return false;
    }

    this.props.dispatch(Actions.connectToChannel(socket, this.props.params.id));
  }

  componentWillUpdate(nextProps, nextState) {
    const { socket } = this.props;
    const { currentAccounting } = nextProps;

    if (currentAccounting.id !== undefined) {
      setDocumentTitle(`Accounting #${currentAccounting.id}`);
    }

    if (socket) {
      return false;
    }

    this.props.dispatch(Actions.connectToChannel(nextProps.socket, this.props.params.id));
  }

  componentWillUnmount() {
    const { currentAccounting } = this.props;
    if (currentAccounting) {
      this.props.dispatch(Actions.leaveChannel(currentAccounting.channel));
    }
  }



  render() {
    const { fetching } = this.props.currentAccounting;
    let content = null;
    const iconClasses = classnames({
      fa: true,
      '': !fetching,
      'fa-spinner': fetching,
      'fa-spin':    fetching,
    });

    if (!fetching) {
      content = (
        <div>
          {this.props.children}
        </div>
      );
    }

    return (
      <div>
        <i className={iconClasses}/>
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

export default connect(mapStateToProps)(AccountingShowView);
