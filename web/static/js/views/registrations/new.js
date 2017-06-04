import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';
import { Link }             from 'react-router';

import { setDocumentTitle, renderErrorsFor } from '../../utils';
import Actions              from '../../actions/registrations';
import { Button, ControlLabel, Form, FormControl, FormGroup, HelpBlock, ButtonToolbar, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

class RegistrationsNew extends React.Component {
  componentDidMount() {
    setDocumentTitle('Регистрация');
  }

  _handleSubmit(e) {
    e.preventDefault();

    const { dispatch } = this.props;

    const data = {
      first_name: this.firstName.value,
      last_name: this.lastName.value,
      email: this.email.value,
      password: this.password.value,
      password_confirmation: this.passwordConfirmation.value,
    };

    dispatch(Actions.signUp(data));
  }

  render() {
    const { errors } = this.props;

    return (
      <Col md={4}>
        <Form onSubmit={::this._handleSubmit}>
          <FormGroup controlId="formFirstName" validationState={renderErrorsFor(errors, 'first_name').length > 0 ? "error" : null}>
            <ControlLabel>First name</ControlLabel>
            <FormControl type="text" inputRef={ref => { this.firstName = ref }} placeholder="First name" required={true} />
            <HelpBlock>{renderErrorsFor(errors, 'first_name')}</HelpBlock>
          </FormGroup>
          <FormGroup controlId="formLastName" validationState={renderErrorsFor(errors, 'last_name').length > 0 ? "error" : null}>
            <ControlLabel>Last name</ControlLabel>
            <FormControl type="text" inputRef={ref => { this.lastName = ref }} placeholder="Last name" required={true} />
            <HelpBlock>{renderErrorsFor(errors, 'last_name')}</HelpBlock>
          </FormGroup>
          <FormGroup controlId="formUserEmail" validationState={renderErrorsFor(errors, 'email').length > 0 ? "error" : null}>
            <ControlLabel>Email</ControlLabel>
            <FormControl type="email" inputRef={ref => { this.email = ref }} placeholder="Email" required={true} />
            <HelpBlock>{renderErrorsFor(errors, 'email')}</HelpBlock>
          </FormGroup>
          <FormGroup controlId="formUserPassword" validationState={renderErrorsFor(errors, 'password').length > 0 ? "error" : null}>
            <ControlLabel>Password</ControlLabel>
            <FormControl type="password" inputRef={ref => { this.password = ref }} placeholder="Password" required={true} />
            <HelpBlock>{renderErrorsFor(errors, 'password')}</HelpBlock>
          </FormGroup>
          <FormGroup controlId="formPasswordConfirmation" validationState={renderErrorsFor(errors, 'password_confirmation').length > 0 ? "error" : null}>
            <ControlLabel>Password confirmation</ControlLabel>
            <FormControl type="password" inputRef={ref => { this.passwordConfirmation = ref }} placeholder="Confirm password" required={true} />
            <HelpBlock>{renderErrorsFor(errors, 'password_confirmation')}</HelpBlock>
          </FormGroup>
          <ButtonToolbar>
            <Button type="submit" bsStyle="primary">Создать аккаунт</Button>
            <LinkContainer to="/sign_in">
              <Button>Войти</Button>
            </LinkContainer>
          </ButtonToolbar>
        </Form>
      </Col>
    );
  }
}

const mapStateToProps = (state) => ({
  errors: state.registration.errors,
});

export default connect(mapStateToProps)(RegistrationsNew);
