import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';
import { Link }             from 'react-router';
import { setDocumentTitle } from '../../utils';
import Actions              from '../../actions/sessions';
import { Button, ControlLabel, Form, FormControl, FormGroup, HelpBlock, ButtonToolbar, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

class SessionsNew extends React.Component {
  componentDidMount() {
    setDocumentTitle('Аутентификация');
  }

  _handleSubmit(e) {
    e.preventDefault();

    const { dispatch } = this.props;

    dispatch(Actions.signIn(this.email.value, this.password.value));
  }

  render() {
    let { error } = this.props;
    return (
      <Col md={4}>
        <Form onSubmit={::this._handleSubmit}>
          <HelpBlock>{error}</HelpBlock>
          <FormGroup controlId="formHorizontalEmail" validationState={error ? "error" : null}>
            <ControlLabel>Email </ControlLabel>
            <FormControl type="email" inputRef={ref => { this.email = ref }} placeholder="Email" />
          </FormGroup>
          <FormGroup controlId="formHorizontalPassword" validationState={error ? "error" : null}>
            <ControlLabel>Password </ControlLabel>
            <FormControl type="password" inputRef={ref => { this.password = ref }} placeholder="Password" />
          </FormGroup>
          <ButtonToolbar>
            <Button type="submit" bsStyle="primary">Войти</Button>
            <LinkContainer to="/sign_up">
              <Button>Создать новый аккаунт</Button>
            </LinkContainer>
          </ButtonToolbar>
        </Form>
      </Col>
    );
  }
}

const mapStateToProps = (state) => (
  state.session
);

export default connect(mapStateToProps)(SessionsNew);
