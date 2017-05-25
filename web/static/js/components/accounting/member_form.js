import React       from 'react';
import Actions     from '../../actions/current_accounting';
import { Form, FormGroup, FormControl, Button, ControlLabel, HelpBlock } from 'react-bootstrap';

export default class MemberForm extends React.Component {
  _handleSubmit(e) {
    e.preventDefault();

    const { email } = this;
    const { dispatch, channel } = this.props;

    dispatch(Actions.addNewMember(channel, email.value));
    this.email.value = '';
  }

  render() {
    const { error } = this.props;
    return (
      <Form inline onSubmit={::this._handleSubmit}>
        {
          error && <HelpBlock>{error}</HelpBlock>
        }
        <FormGroup>
          <ControlLabel>Email участника</ControlLabel>
          {' '}
          <FormControl inputRef={(input) => this.email = input} placeholder="demo@example.com" required={true} type="email" size="20" name="email" />
        </FormGroup>
        {' '}
        <Button type="submit" bsStyle="primary">
          Добавить
        </Button>
      </Form>
    );
  }
}
