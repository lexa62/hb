import React, {PropTypes}   from 'react';
import { connect }          from 'react-redux';

import Actions              from '../../actions/current_accounting';
import Constants            from '../../constants';
import { setDocumentTitle } from '../../utils';
import update from 'immutability-helper';
import { Checkbox, Button, Form, FormGroup, ControlLabel, FormControl, ListGroup, ListGroupItem,
         Well, Grid, Col, Row, Nav, NavItem } from 'react-bootstrap';
import TreeView from 'react-treeview';

class Category extends React.Component {
  _handleEditClick(e) {
    e.preventDefault();

    const { dispatch, id } = this.props;

    dispatch(Actions.editCategory(id));
  }

  _handleDeleteClick(e) {
    e.preventDefault();

    const { dispatch, id, channel } = this.props;

    dispatch(Actions.removeCategory(channel, id));
  }

  render() {
    const { name, id } = this.props;
    return (
      <ListGroupItem key={id}>
        {name}
        {' '}
        <a onClick={::this._handleEditClick}><i className="fa fa-pencil-square-o" aria-hidden="true"></i></a>
        {' '}
        <a onClick={::this._handleDeleteClick}><i className="fa fa-trash-o" aria-hidden="true"></i></a>
      </ListGroupItem>
    )
  }
}

class CategoryForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = ::this.getState(props);
  }

  getState(props) {
    const obj = {
      name: props.name,
      type: props.editingCategoryType,
      parent_id: props.parent_id || "0"
    };
    return obj;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id || nextProps.editingCategoryType !== this.props.editingCategoryType) {
      this.setState(::this.getState(nextProps));
    }
  }


  _handleCancelEditClick(e) {
    // e.preventDefault();

    // const { dispatch, isEdit } = this.props;

    // if(isEdit) dispatch(Actions.editFinancialGoal(null));
    // else dispatch(Actions.showFinancialGoalForm(false));
  }

  _handleSubmit(e) {
    e.preventDefault();

    const { dispatch, channel, isEdit, id, editingCategoryType } = this.props;
    const { name, parent_id, type } = this.state;
    const parent_id_param = parent_id === "0" ? null : parent_id;
    const type_param = isEdit ? type : editingCategoryType;

    let data = {
      name: name,
      type: type_param,
      parent_id: parent_id_param
    };

    if(isEdit) {
      data = {...data, id: id }
      dispatch(Actions.updateCategory(channel, data));
    } else {
      dispatch(Actions.addCategory(channel, data));
      this.setState(::this.getState(this.props));
    }
  }

  _handleInputChange(event) {
    const target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    const { dispatch, isEdit } = this.props;

    switch (name) {
      case 'type':
        if(isEdit) {
          this.setState({
            [name]: value,
            parent_id: "0"
          });
        }
        else dispatch(Actions.changeCategoryType(value));
      default:
        this.setState({
          [name]: value
        });
    }

  }

  render() {
    // console.log('PROPS', this.props);
    // console.log('STATE', this.state);
    const { categories, editingCategoryType } = this.props;
    return (
      <Form onSubmit={::this._handleSubmit}>
        <FormGroup>
          <ControlLabel>Название</ControlLabel>
          {' '}
          <FormControl name="name" required={true} type="text" value={this.state.name} size="8" onChange={::this._handleInputChange} />
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>Тип категории</ControlLabel>
          {' '}
          <FormControl componentClass="select" required={true} name="type" value={this.state.type} onChange={::this._handleInputChange}>
            <option value={Constants.EXPENSE}>Расходная</option>
            <option value={Constants.INCOME}>Приходная</option>
          </FormControl>
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>Родительская категория</ControlLabel>
          {' '}
          <FormControl componentClass="select" required={true} name="parent_id" value={this.state.parent_id} onChange={::this._handleInputChange}>
            <option value="0">Корневая категория</option>
            {
              categories.filter(c => c.type == this.state.type).map((c) => {
                return (
                  <option key={c.id} value={c.id}>{c.name}</option>
                )
              })
            }
          </FormControl>
        </FormGroup>
        {' '}
        <Button type="submit" bsStyle="primary">
          Применить
        </Button>
        {' '}
        {/*<a onClick={::this._handleCancelEditClick}>Отмена</a>*/}
      </Form>
    )
  }
}

class Testt extends React.Component {
  _handleEditClick(e) {
    e.preventDefault();

    const { dispatch, id } = this.props;

    dispatch(Actions.editCategory(id));
  }

  _handleDeleteClick(e) {
    e.preventDefault();

    const { dispatch, id, channel } = this.props;

    dispatch(Actions.removeCategory(channel, id));
  }

  render() {
    const { name, br } = this.props;
    return (
      <span>
        {name}
        {' '}
        <a onClick={::this._handleEditClick}><i className="fa fa-pencil-square-o" aria-hidden="true"></i></a>
        {' '}
        <a onClick={::this._handleDeleteClick}><i className="fa fa-trash-o" aria-hidden="true"></i></a>
        {
          br && (<br/>)
        }
      </span>
    )
  }
}


class AccountingCategoriesView extends React.Component {
  render_hz(node_key, category, sibling_count) {
    const { dispatch, currentAccounting } = this.props;
    const { channel, editingCategoryType } = currentAccounting;
    if(category.node.type == editingCategoryType) {
      const label2 = <Testt key={category.node.id} br={false} dispatch={dispatch} channel={channel} {...category.node} />
      let all_keys = Object.keys(category);
      const index = all_keys.indexOf("node");
      all_keys.splice(index, 1);
      return (
        all_keys.length > 0 ? (
        <TreeView nodeLabel={label2} key={node_key} defaultCollapsed={false}>
          {/*<div className="info">age: {node_key.age}</div>
          <div className="info">sex: {node_key.sex}</div>
          <div className="info">role: {node_key.role}</div>
          <div className="info">id: {category.node.id}</div>*/}
          { all_keys.length > 0 ? all_keys.map(child => ::this.render_hz(child, category[child], all_keys.length)) : '' }
        </TreeView>) : (<Testt key={category.node.id} dispatch={dispatch} channel={channel} br={sibling_count>1} {...category.node} />)
      );
    }
  }

  // modify_node(node) {
  //   const categories = this.props.currentAccounting.categories;
  //   categories.filter(category => category.parent_id == node.id).map(child => {

  //   })
  // }

  render() {
    const { currentAccounting, dispatch } = this.props;
    const { fetching, channel, categories, error, editingCategoryId, editingCategoryType, categories_tree } = currentAccounting;
    let content = null;
    let edit_category = {};
    if (!fetching) {

      if(editingCategoryId) {
        edit_category = categories.find(a => a.id == editingCategoryId)
        const newEditingCategoryType = edit_category.type == Constants.EXPENSE || edit_category.type == Constants.INCOME ? edit_category.type : Constants.EXPENSE
        if(newEditingCategoryType !== editingCategoryType) dispatch(Actions.changeCategoryType(newEditingCategoryType));
        // if(!edit_category.parent_id) edit_category.parent_id = "0"
      }

      content = (
        <Row>
          <Col md={6}>
            <h4>Категории:</h4>
            <Well>
              <div>
                {Object.keys(categories_tree).map((node) => {
                  const category = categories_tree[node];
                  if(category.node.type == editingCategoryType) {
                    const label = <Testt key={category.node.id} dispatch={dispatch} channel={channel} {...category.node} />;
                    let all_keys = Object.keys(category)
                    const index = all_keys.indexOf("node");
                    all_keys.splice(index, 1);
                    const sibling_count = all_keys.length;

                    return (
                      <TreeView key={category.node.id} nodeLabel={label} defaultCollapsed={false}>
                        {/*<div className="info">id: {category.node.id}</div>*/}
                        {
                          all_keys.map(key => {
                            return(::this.render_hz(key, category[key], sibling_count))
                          })
                        }
                      </TreeView>
                    );
                  }
                })}
              </div>
            </Well>
          </Col>

          <Col md={6}>
            <h4>Создать/обновить категорию:</h4>
            <Well>
              <CategoryForm
                id={edit_category.id || ''}
                name={edit_category.name || ''}
                parent_id={edit_category.parent_id || '0'}
                type={edit_category.type || ''}
                isEdit={editingCategoryId != undefined}
                dispatch={dispatch}
                categories={categories}
                editingCategoryType={editingCategoryType}
                channel={channel} />
            </Well>
          </Col>
        </Row>
      );
    }

    return (
      <Grid fluid>
        {content}
      </Grid>
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccounting: state.currentAccounting,
  socket: state.session.socket,
  currentUser: state.session.currentUser
});

export default connect(mapStateToProps)(AccountingCategoriesView);
