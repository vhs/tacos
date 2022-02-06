import React, { Component } from 'react'

import 'bootstrap/dist/css/bootstrap.min.css'

import { Container } from 'react-bootstrap'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import { stateMachine } from 'pretty-state-machine'

// import logo from './logo.svg';
import './App.css'

import Menu from './Components/Menu'
import Login from './Pages/Login'
import Home from './Pages/Home'
import Dashboard from './Pages/Dashboard'
import Devices from './Pages/Devices'
import Terminals from './Pages/Terminals'
import Logging from './Pages/Logging'

import apiService from './services/api'

import CustomLogger from './lib/custom-logger'

const log = new CustomLogger('tacos:app')

class App extends Component {
  constructor (props) {
    super(props)

    log.debug('constructor', this.props)

    this.state = {
      loggedIn: stateMachine.get('loggedIn', false),
      roles: stateMachine.get('roles', []),
      user: stateMachine.get('user', { authenticated: false })
    }

    this.apiService = apiService
  }

  async componentDidMount () {
    // log.debug('App', 'componentDidMount', 'apiService.getSession()', apiService.getSession())
    const session = await apiService.getSession()

    this.setState({ ...this.state, ...session })

    stateMachine.sub('loggedIn', this.setState.bind(this))
    stateMachine.sub('roles', this.setState.bind(this))
    stateMachine.sub('user', this.setState.bind(this))
    stateMachine.sub((state) => log.debug('state', state))
  }

  render () {
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
            <Route path="/" exact>
              {this.state.loggedIn ? <Redirect to="/dashboard" /> : <Home />}
            </Route>
          </Switch>
        </Container>
      </Router>
    )
  }
}

export default (App)
