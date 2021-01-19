import React, { Component } from 'react'

import 'bootstrap/dist/css/bootstrap.min.css';

import { Container } from 'react-bootstrap'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

// import logo from './logo.svg';
import './App.css';

import Menu from './Components/Menu'
import Login from './Pages/Login'
import Home from './Pages/Home'
import Dashboard from './Pages/Dashboard'
import Devices from './Pages/Devices'
import Terminals from './Pages/Terminals'
import Logging from './Pages/Logging'

import stateMachine from './services/statemachine'
import apiSvc from './services/api'

import CustomLogger from './lib/custom-logger'

var log = new CustomLogger('tacos:app')

class App extends Component {
  constructor(props) {
    super(props)

    log.debug('constructor', this.props)

    this.state = {
      loggedIn: false,
      roles: [],
      user: {}
    }

    this.apiSvc = apiSvc
  }

  componentDidMount() {
    // log.debug('App', 'componentDidMount', 'apiSvc.getSession()', apiSvc.getSession())
    this.setState({ ...this.state, ...this.session })

    stateMachine.sub('state', (args) => {
      let updateState = {}
      for (let arg in args) {
        if (this.state[arg] !== undefined && this.state[arg] !== args[arg])
          updateState[arg] = args[arg]
      }

      if (Object.keys(updateState).length > 0) {
        log.debug('App->updateState', updateState)
        this.setState(updateState)
      }
    })
  }

  render() {
    return (
      <Router>
        <Container>
          <Menu />
          <Switch>
            <Route path="/dashboard">
              {this.state.loggedIn ? <Dashboard /> : <Redirect to="/login" />}
            </Route>
            <Route path="/devices">
              {this.state.loggedIn ? <Devices user={this.state.user} roles={this.state.roles} /> : <Redirect to="/login" />}
            </Route>
            <Route path="/terminals">
              {this.state.user.administrator ? <Terminals user={this.state.user} roles={this.state.roles} /> : <Redirect to="/dashboard" />}
            </Route>
            <Route path="/logging">
              {this.state.user.administrator ? <Logging user={this.state.user} roles={this.state.roles} /> : <Redirect to="/dashboard" />}
            </Route>
            <Route path="/login">
              {this.state.loggedIn ? <Redirect to="/dashboard" /> : <Login />}
            </Route>
            <Route path="/" exact="true">
              {this.state.loggedIn ? <Redirect to="/dashboard" /> : <Home />}
            </Route>
          </Switch>
        </Container>
      </Router>
    );
  }
}

export default (App);
