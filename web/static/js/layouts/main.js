import React from 'react';
import { Link } from 'react-router';
import { connect }          from 'react-redux';
import { Navbar, Nav, NavItem, MenuItem, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import SessionActions              from '../actions/sessions';

class MainLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  _handleSignOut() {
    this.props.dispatch(SessionActions.signOut());
  }

  render() {
    const { currentAccounting, currentUser } = this.props;
    let navbar_main_links = null;
    if(currentAccounting.id) {
      navbar_main_links = (
        <Nav>
          <LinkContainer to={`/accounting/${currentAccounting.id}`} onlyActiveOnIndex={true}>
            <NavItem eventKey={1}>Операции</NavItem>
          </LinkContainer>
          <LinkContainer to={`/accounting/${currentAccounting.id}/financial_goals`}>
            <NavItem eventKey={2}>Накопления</NavItem>
          </LinkContainer>
          {/*<LinkContainer to={`/accounting/${currentAccounting.id}/budget_planning`}>
            <NavItem eventKey={3}>Планирование</NavItem>
          </LinkContainer>*/}
          <LinkContainer to={`/accounting/${currentAccounting.id}/reports`}>
            <NavItem eventKey={4}>Отчёты</NavItem>
          </LinkContainer>
          {/*<LinkContainer to={`/accounting/${currentAccounting.id}/settings`}>
            <NavItem eventKey={5}>Настройки</NavItem>
          </LinkContainer>*/}
          <NavDropdown eventKey={6} title="Настройки" id="basic-nav-dropdown">
            <LinkContainer to={`/accounting/${currentAccounting.id}/expense_categories`}>
              <MenuItem eventKey={6.1}>Категории</MenuItem>
            </LinkContainer>
            {/*<LinkContainer to={`/accounting/${currentAccounting.id}/income_categories`}>
              <MenuItem eventKey={6.2}>Источники доходов</MenuItem>
            </LinkContainer>*/}
            <LinkContainer to={`/accounting/${currentAccounting.id}/accounts`}>
              <MenuItem eventKey={6.3}>Счета</MenuItem>
            </LinkContainer>
            <LinkContainer to={`/accounting/${currentAccounting.id}/currencies`}>
              <MenuItem eventKey={6.4}>Валюты</MenuItem>
            </LinkContainer>
            <LinkContainer to={`/accounting/${currentAccounting.id}/export_import`}>
              <MenuItem eventKey={6.5}>Экспорт/импорт</MenuItem>
            </LinkContainer>
            <LinkContainer to={`/accounting/${currentAccounting.id}/participants`}>
              <MenuItem eventKey={6.6}>Участники</MenuItem>
            </LinkContainer>
          </NavDropdown>
        </Nav>
      );
    }
    return (
      <div>
        <Navbar fluid>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">HB</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            {navbar_main_links}
            <Nav pullRight>
              {currentUser && currentUser.email ?
                (
                  <NavDropdown eventKey={1} title={currentUser.email} id="dropdown-user">
                    <MenuItem eventKey={1.1} onSelect={::this._handleSignOut}>Выход</MenuItem>
                  </NavDropdown>
                ) :(
                  <LinkContainer to="/sign_in">
                    <NavItem eventKey={2}>Войти</NavItem>
                  </LinkContainer>
                )
              }
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <div className="container-fluid">
          {this.props.children}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccounting: state.currentAccounting,
  currentUser: state.session.currentUser
});

export default connect(mapStateToProps)(MainLayout);
