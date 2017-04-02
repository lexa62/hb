import React                from 'react';
import { connect }          from 'react-redux';
import classnames           from 'classnames';
import { Link }             from 'react-router';

import { setDocumentTitle } from '../../utils';
// import Actions              from '../../actions/boards';
// import BoardCard            from '../../components/boards/card';
// import BoardForm            from '../../components/boards/form';
import Actions              from '../../actions/sessions';
import { push }           from 'react-router-redux';

class AccountingCard extends React.Component {
  // _handleClick() {
  //   this.props.dispatch(push(`/accounting/${this.props.id}`));
  // }

  render() {
    return (
      <div id={this.props.id} className="board">
        <div className="inner">
          <Link to={`/accounting/${this.props.id}`}>
            <li>#{this.props.id}</li>
          </Link>
        </div>
      </div>
    );
  }
}


class HomeIndexView extends React.Component {
  componentDidMount() {
    setDocumentTitle('Home');
  }

  // componentWillUnmount() {
  //   this.props.dispatch(Actions.reset());
  // }

  _renderOwnedAccounting() {
    const { fetching, ownedAccounting, participatedAccounting } = this.props;

    let content = false;

    const iconClasses = classnames({
      fa: true,
      'fa-user': !fetching,
      'fa-spinner': fetching,
      'fa-spin':    fetching,
    });

    if (!fetching) {
      content = (
        <div className="boards-wrapper">
          <ul>
            {
              ownedAccounting.map((accounting) => {
                return <AccountingCard key={accounting.id} dispatch={this.props.dispatch} {...accounting} />;
              })
            }
          </ul>
          <br/>
          <h3>Приглашения:</h3>
          {participatedAccounting.map((accounting) => {
            return (<p>{accounting.id}</p>);
          })}
        </div>
      );
    }

    return (
      <section>
        <header className="view-header">
          <p>fetching: {fetching ? 'Yes' : 'No'}</p>
          <h3><i className={iconClasses} /> Мои аккаунты:</h3>
        </header>
        {content}
      </section>
    );
  }

  // _renderBoards(boards) {
  //   return boards.map((board) => {
  //     return <BoardCard
  //               key={board.id}
  //               dispatch={this.props.dispatch}
  //               {...board} />;
  //   });
  // }

  // _renderAddNewBoard() {
  //   let { showForm, dispatch, formErrors } = this.props;

  //   if (!showForm) return this._renderAddButton();

  //   return (
  //     <BoardForm
  //       dispatch={dispatch}
  //       errors={formErrors}
  //       onCancelClick={::this._handleCancelClick}/>
  //   );
  // }

  // _renderOtherAccounting() {
  //   const { invitedBoards } = this.props;

  //   if (invitedBoards.length === 0) return false;

  //   return (
  //     <section>
  //       <header className="view-header">
  //         <h3><i className="fa fa-users" /> Other boards</h3>
  //       </header>
  //       <div className="boards-wrapper">
  //         {::this._renderBoards(invitedBoards)}
  //       </div>
  //     </section>
  //   );
  // }

  // _renderAddButton() {
  //   return (
  //     <div className="board add-new" onClick={::this._handleAddNewClick}>
  //       <div className="inner">
  //         <a id="add_new_board">Add new board...</a>
  //       </div>
  //     </div>
  //   );
  // }

  // _handleAddNewClick() {
  //   let { dispatch } = this.props;

  //   dispatch(Actions.showForm(true));
  // }

  // _handleCancelClick() {
  //   this.props.dispatch(Actions.showForm(false));
  // }

  render() {
    return (
      <div className="view-container boards index">
        {::this._renderOwnedAccounting()}
        {/*::this._renderOtherAccounting()*/}
        <a href="#" onClick={::this._handleSignOutClick}><i className="fa fa-sign-out"/> Sign out</a>
      </div>
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
// export default connect(null, mapDispatchToProps)(HomeIndexView);
// export default HomeIndexView;
