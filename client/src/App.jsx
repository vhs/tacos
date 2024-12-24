import React, { Component } from 'react'

import 'bootstrap/dist/css/bootstrap.min.css'

import { stateMachine } from 'pretty-state-machine'
import { Container } from 'react-bootstrap'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from 'react-router-dom'

import Menu from './Components/Menu/index.jsx'
import CustomLogger from './lib/custom-logger/index.js'
import Dashboard from './Pages/Dashboard/index.jsx'
import Devices from './Pages/Devices/index.jsx'
import Home from './Pages/Home/index.jsx'
import Logging from './Pages/Logging/index.jsx'
import Login from './Pages/Login/index.jsx'
import Terminals from './Pages/Terminals/index.jsx'
import apiService from './services/api/index.js'

import './App.css'

const log = new CustomLogger('tacos:app')

class App extends Component {
    constructor(props) {
        super(props)

        log.debug('constructor', this.props)

        this.state = {
            loggedIn: stateMachine.get('loggedIn', false),
            roles: stateMachine.get('roles', []),
            user: stateMachine.get('user', { authenticated: false })
        }

        this.apiService = apiService
    }

    async componentDidMount() {
        // log.debug('App', 'componentDidMount', 'apiService.getSession()', apiService.getSession())
        const session = await this.apiService.getSession()

        this.setState((currentState) => ({ ...currentState, ...session }))

        stateMachine.sub('loggedIn', this.setState.bind(this))
        stateMachine.sub('roles', this.setState.bind(this))
        stateMachine.sub('user', this.setState.bind(this))
        stateMachine.sub((state) => log.debug('state', state))
    }

    render() {
        return (
            <Router>
                <Container>
                    <Menu />
                    <Switch>
                        <Route path='/dashboard'>
                            {this.state.loggedIn ? (
                                <Dashboard />
                            ) : (
                                <Redirect to='/login' />
                            )}
                        </Route>
                        <Route path='/devices'>
                            {this.state.loggedIn ? (
                                <Devices
                                    user={this.state.user}
                                    roles={this.state.roles}
                                />
                            ) : (
                                <Redirect to='/login' />
                            )}
                        </Route>
                        <Route path='/terminals'>
                            {this.state.user.administrator ? (
                                <Terminals
                                    user={this.state.user}
                                    roles={this.state.roles}
                                />
                            ) : (
                                <Redirect to='/dashboard' />
                            )}
                        </Route>
                        <Route path='/logging'>
                            {this.state.user.administrator ? (
                                <Logging
                                    user={this.state.user}
                                    roles={this.state.roles}
                                />
                            ) : (
                                <Redirect to='/dashboard' />
                            )}
                        </Route>
                        <Route path='/login'>
                            {this.state.loggedIn ? (
                                <Redirect to='/dashboard' />
                            ) : (
                                <Login />
                            )}
                        </Route>
                        <Route path='/' exact>
                            {this.state.loggedIn ? (
                                <Redirect to='/dashboard' />
                            ) : (
                                <Home />
                            )}
                        </Route>
                    </Switch>
                </Container>
            </Router>
        )
    }
}

export default App
