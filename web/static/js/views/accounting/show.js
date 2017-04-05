import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';
// import {DragDropContext}    from 'react-dnd';
// import HTML5Backend         from 'react-dnd-html5-backend';

import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
// import ListForm             from '../../components/lists/form';
// import ListCard             from '../../components/lists/card';
// import BoardMembers           from '../../components/boards/members';

// @DragDropContext(HTML5Backend)

class TransactionRow extends React.Component {
  render() {
    return (
      <li>{`Amount: ${this.props.amount}, description: '${this.props.description}', type: ${this.props.type}, currency: ${this.props.currency}`}</li>
    );
  }
}

class TransactionList extends React.Component {
  render() {
    const transactions = this.props.transactions.map((transaction) => {
      return <TransactionRow key={transaction.id} {...transaction} />
    });

    return (
      <ul>
        {transactions}
      </ul>
    );
  }
}

class AccountingForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      type: Constants.EXPENSE,
      amount: '',
      description: '',
      currency: props.defaultCurrency.iso_code
    };
  };


  _handleSubmit(e) {
    e.preventDefault();

    const { dispatch, channel, accountingId, defaultCurrency } = this.props;
    let { type, amount, description, currency } = this.state;

    // amount = amount.replace(/,/g, '.');

    const data = {
      type: type,
      amount: amount,
      description: description,
      currency: currency
    };

    dispatch(Actions.createTransaction(channel, data));

    this.setState({
      type: Constants.EXPENSE,
      amount: '',
      description: '',
      currency: defaultCurrency.iso_code
    });
  }

  _handleInputChange(event) {
    const target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    switch (name) {
      case 'amount':
        value = value.replace(/[^0-9.]+/g, '');
      default:
      ;
    }

    this.setState({
      [name]: value
    });
  }

  render() {
    return (
      <form onSubmit={::this._handleSubmit}>
        <label>
          Amount:
          <input name="amount" type="text" value={this.state.amount} onChange={::this._handleInputChange} />
        </label>
        <label>
          Type:
          <select name="type" value={this.state.type} onChange={::this._handleInputChange}>
            <option value={Constants.EXPENSE}>EXPENSE</option>
            <option value={Constants.INCOME}>INCOME</option>
            <option value={Constants.TRANSFER}>TRANSFER</option>
          </select>
        </label>
        <label>
          Currency:
          <select name="currency" value={this.state.currency} onChange={::this._handleInputChange}>
            {
              this.props.currencies.map((c) => {
                return (
                  <option key={c.id} value={c.iso_code}>{c.name}</option>
                )
              })
            }
          </select>
        </label>
        <label>
          Description:
          <input name="description" type="text" value={this.state.description} onChange={::this._handleInputChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

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

  // _renderMembers() {
  //   const { connectedUsers, showUsersForm, channel, error } = this.props.currentAccounting;
  //   const { dispatch } = this.props;
  //   const members = this.props.currentAccounting.members;
  //   const currentUserIsOwner = this.props.currentAccounting.user.id === this.props.currentUser.id;

  //   return (
  //     <BoardMembers
  //       dispatch={dispatch}
  //       channel={channel}
  //       currentUserIsOwner={currentUserIsOwner}
  //       members={members}
  //       connectedUsers={connectedUsers}
  //       error={error}
  //       show={showUsersForm} />
  //   );
  // }

  // _renderLists() {
  //   const { lists, channel, editingListId, id, addingNewCardInListId } = this.props.currentAccounting;

  //   return lists.map((list) => {
  //     return (
  //       <ListCard
  //         key={list.id}
  //         boardId={id}
  //         dispatch={this.props.dispatch}
  //         channel={channel}
  //         isEditing={editingListId === list.id}
  //         onDropCard={::this._handleDropCard}
  //         onDropCardWhenEmpty={::this._handleDropCardWhenEmpty}
  //         onDrop={::this._handleDropList}
  //         isAddingNewCard={addingNewCardInListId === list.id}
  //         {...list} />
  //     );
  //   });
  // }

  // _renderAddNewList() {
  //   const { dispatch, formErrors, currentAccounting } = this.props;

  //   if (!currentAccounting.showForm) return this._renderAddButton();

  //   return (
  //     <ListForm
  //       dispatch={dispatch}
  //       errors={formErrors}
  //       channel={currentAccounting.channel}
  //       onCancelClick={::this._handleCancelClick} />
  //   );
  // }

  // _renderAddButton() {
  //   return (
  //     <div className="list add-new" onClick={::this._handleAddNewClick}>
  //       <div className="inner">
  //         Add new list...
  //       </div>
  //     </div>
  //   );
  // }

  // _handleAddNewClick() {
  //   const { dispatch } = this.props;

  //   dispatch(Actions.showForm(true));
  // }

  // _handleCancelClick() {
  //   this.props.dispatch(Actions.showForm(false));
  // }

  // _handleDropCard({ source, target }) {
  //   const { lists, channel } = this.props.currentAccounting;
  //   const { dispatch } = this.props;

  //   const sourceListIndex = lists.findIndex((list) => { return list.id === source.list_id; });
  //   const sourceList = lists[sourceListIndex];
  //   const sourceCardIndex = sourceList.cards.findIndex((card) => { return card.id === source.id; });
  //   const sourceCard = sourceList.cards[sourceCardIndex];

  //   const targetListIndex = lists.findIndex((list) => { return list.id === target.list_id; });
  //   let targetList = lists[targetListIndex];
  //   const targetCardIndex = targetList.cards.findIndex((card) => { return card.id === target.id; });
  //   const targetCard = targetList.cards[targetCardIndex];
  //   const previousTargetCard = sourceList.cards[sourceCardIndex + 1];

  //   if (previousTargetCard === targetCard) { return false; }

  //   sourceList.cards.splice(sourceCardIndex, 1);

  //   if (sourceList === targetList) {
  //     const insertIndex = sourceCardIndex < targetCardIndex ? targetCardIndex - 1 : targetCardIndex;
  //     // move at once to avoid complications
  //     targetList = sourceList;
  //     sourceList.cards.splice(insertIndex, 0, source);
  //   } else {
  //     // and move it to target
  //     targetList.cards.splice(targetCardIndex, 0, source);
  //   }

  //   const newIndex = targetList.cards.findIndex((card) => { return card.id === source.id; });

  //   const position = newIndex == 0 ? targetList.cards[newIndex + 1].position / 2 : newIndex == (targetList.cards.length - 1) ? targetList.cards[newIndex - 1].position + 1024 : (targetList.cards[newIndex - 1].position + targetList.cards[newIndex + 1].position) / 2;

  //   const data = {
  //     id: sourceCard.id,
  //     list_id: targetList.id,
  //     position: position,
  //   };

  //   dispatch(Actions.updateCard(channel, data));
  // }

  // _handleDropList({ source, target }) {
  //   const { lists, channel } = this.props.currentAccounting;
  //   const { dispatch } = this.props;

  //   const sourceListIndex = lists.findIndex((list) => { return list.id === source.id; });
  //   const sourceList = lists[sourceListIndex];
  //   lists.splice(sourceListIndex, 1);

  //   const targetListIndex = lists.findIndex((list) => { return list.id === target.id; });
  //   const targetList = lists[targetListIndex];
  //   lists.splice(targetListIndex, 0, sourceList);

  //   const newIndex = lists.findIndex((list) => { return list.id === source.id; });

  //   const position = newIndex == 0 ? lists[newIndex + 1].position / 2 : newIndex == (lists.length - 1) ? lists[newIndex - 1].position + 1024 : (lists[newIndex - 1].position + lists[newIndex + 1].position) / 2;

  //   const data = {
  //     id: source.id,
  //     position: position,
  //   };

  //   dispatch(Actions.updateList(channel, data));
  // }

  // _handleDropCardWhenEmpty(card) {
  //   const { channel } = this.props.currentAccounting;
  //   const { dispatch } = this.props;

  //   dispatch(Actions.updateCard(channel, card));
  // }

  render() {
    const { currentAccounting, dispatch } = this.props;
    const { fetching, channel, transactions, id, currencies } = currentAccounting;
    let content = null;

    if (!fetching) {
      content = (
        <div>
          <AccountingForm
            accountingId={id}
            dispatch={dispatch}
            currencies={currencies}
            defaultCurrency={currencies.find(c => c.is_default) || currencies[0]}
            channel={channel} />
          <TransactionList transactions={transactions} />
        </div>
      );
    }

    return (
      <div className="well">
        <h2>Accounting page</h2>
        <p>fetching: {fetching ? 'Y' : 'N'}</p>
        {content}
      </div>
    );
    // const { fetching, name } = this.props.currentAccounting;

    // if (fetching) return (
    //   <div className="view-container boards show">
    //     <i className="fa fa-spinner fa-spin"/>
    //   </div>
    // );

    // return (
    //   <div className="view-container boards show">
    //     <header className="view-header">
    //       <h3>{name}</h3>
    //       {::this._renderMembers()}
    //     </header>
    //     <div className="canvas-wrapper">
    //       <div className="canvas">
    //         <div className="lists-wrapper">
    //           {::this._renderLists()}
    //           {::this._renderAddNewList()}
    //         </div>
    //       </div>
    //     </div>
    //     {this.props.children}
    //   </div>
    // );
  }
}

const mapStateToProps = (state) => ({
  currentAccounting: state.currentAccounting,
  socket: state.session.socket,
  currentUser: state.session.currentUser
});

export default connect(mapStateToProps)(AccountingShowView);
