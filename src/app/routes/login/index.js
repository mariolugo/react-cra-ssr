import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Page from '../../components/page';
import { AUTH_TOKEN } from '../../../constants.js';
import { setCurrentUser } from '../../../modules/auth';
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import cookies from 'js-cookie'
import FacebookLogin from 'react-facebook-login';

const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
    }
  }
`

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`

const FACEBOOK_LOGIN = gql`
  mutation FacebookSignIn($code: String!) {
    facebookSignIn(code: $code) {
      user {
        email
        name
      }
      session {
        token
      }
    }
  }
`;

class Login extends Component {
  state = {
    login: true, // switch between Login and SignUp
    email: '',
    password: '',
    name: '',
  };

  _confirm = async data => {
    const { token } = this.state.login ? data.login : data.signup
    this._saveUserData(token, this.state.email);
    this.props.history.push(`/`);
  }

  _saveUserData = (token, email) => {
    cookies.set(AUTH_TOKEN, token);
    this.props.setCurrentUser({email});
  }

  _onError = error => {
    console.log({error});
  }

  _responseFacebook = (response) => {
    console.log({response});
  }

  render(){
    const { login, email, password, name } = this.state;
    return (
      <Page>
        <h4 className="mv3">{login ? 'Login' : 'Sign Up'}</h4>
        <div className="flex flex-column">
          {!login && (
            <input
              value={name}
              onChange={e => this.setState({ name: e.target.value })}
              type="text"
              placeholder="Your name"
            />
          )}
          <input
            value={email}
            onChange={e => this.setState({ email: e.target.value })}
            type="text"
            placeholder="Your email address"
          />
          <input
            value={password}
            onChange={e => this.setState({ password: e.target.value })}
            type="password"
            placeholder="Choose a safe password"
          />
        </div>
        <div className="flex mt3">
          <Mutation
            mutation={login ? LOGIN_MUTATION : SIGNUP_MUTATION}
            variables={{ email, password, name }}
            onCompleted={data => this._confirm(data)}
          >
            {(mutation, {loading, error}) => {
              if (error) this._onError(error);
              return (
                  <div className="pointer mr2 button" onClick={mutation}>
                    {login ? 'login' : 'create account'}
                  </div>
              );
            }}
          </Mutation>
          <div
            className="pointer button"
            onClick={() => this.setState({ login: !login })}
          >
            {login
              ? 'need to create an account?'
              : 'already have an account?'}
          </div>
        </div>
        <Mutation
          mutation={FACEBOOK_LOGIN}
        >
          {postMutation => <FacebookLogin
            appId="1748924262089537"
            autoLoad={true}
            fields="name,email,picture"
            callback={postMutation}
            cssClass="facebook-button"
            icon="fa-facebook"
          />}
        </Mutation>
      </Page>
    );
  }
};

const mapDispatchToProps = dispatch =>
  bindActionCreators({ setCurrentUser }, dispatch);

export default connect(
  null,
  mapDispatchToProps
)(Login);
