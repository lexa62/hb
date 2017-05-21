import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';
// import {DragDropContext}    from 'react-dnd';
// import HTML5Backend         from 'react-dnd-html5-backend';

import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
import classnames           from 'classnames';
// import Select2 from 'react-select2-wrapper';
// import ListForm             from '../../components/lists/form';
// import BoardMembers           from '../../components/boards/members';

// @DragDropContext(HTML5Backend)

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
    // const { currentAccounting, dispatch } = this.props;
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
          {/*<Select2
            data={[
              { id: 0, text: 'test'},
              { id: 1, text: 'Еда',
                children: [
                  { text: 'Столовка', id: 2 },
                  { text: 'Магазин', id: 3, children: [
                    { text: 'Овощи', id: 4 },
                    { text: 'Фрукты', id: 5 }
                  ] },
                ],
              },
              { text: 'Развлечения', id: 6 },
              { text: 'Путешествия', id: 7 },
            ]}
            options={
              {
                placeholder: 'search',
              }
            }
          />*/}
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
