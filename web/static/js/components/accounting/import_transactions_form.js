import React       from 'react';
import Actions     from '../../actions/current_accounting';

export default class ImportTransactionsForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      file: null,
      error: null
    };
  }
  _renderError() {
    const error = this.props.error || this.state.error;

    if (!error) return false;

    return (
      <div className="error">
        {error}
      </div>
    );
  }

  _handleInputChange(event) {
    const target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  _handleSubmit(e) {
    e.preventDefault();

    const { file } = this;
    const { accountingId } = this.props;

    const file_obj = file.files[0];
    if(file_obj.type === "text/csv") {
      let fd = new FormData();
      fd.append('file', file_obj);
      Actions.importTransactions(accountingId, fd);
      this.file.value = null;
      this.setState({
        "error": null,
        "file": null
      });
    } else {
      this.setState({...this.state, error: "Wrong file format"});
    }
  }

  render() {
    return (
      <form onSubmit={::this._handleSubmit} encType="multipart/form-data">
        <h4>Импорт транзакций</h4>
        {::this._renderError()}
        <input ref={(input) => this.file = input} type="file" name="file" onChange={::this._handleInputChange} placeholder="Файл"/>
        <button type="submit">Импорт</button>
      </form>
    );
  }
}
