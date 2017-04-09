import React       from 'react';
import Actions     from '../../actions/current_accounting';

export default class MemberForm extends React.Component {
  _renderError() {
    const { error } = this.props;

    if (!error) return false;

    return (
      <div className="error">
        {error}
      </div>
    );
  }

  _handleSubmit(e) {
    e.preventDefault();

    const { email } = this;
    const { dispatch, channel } = this.props;

    dispatch(Actions.addNewMember(channel, email.value));
    this.email.value = '';
  }

  render() {
    return (
      <form onSubmit={::this._handleSubmit}>
        <h4>Добавление участника</h4>
        {::this._renderError()}
        <input ref={(input) => this.email = input} type="email" required={true} placeholder="Email участника"/>
        <button type="submit">Добавить</button>
      </form>
    );
  }
}
