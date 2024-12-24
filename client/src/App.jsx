import { Component } from 'react'

import 'bootstrap/dist/css/bootstrap.min.css'

import { stateMachine } from 'pretty-state-machine'
import { Container } from 'react-bootstrap'
import { BrowserRouter, redirect, Route, Routes } from 'react-router'
import { SWRConfig } from 'swr'

import Menu from './Components/Menu/index.jsx'
import CustomLogger from './lib/custom-logger/index.js'
import { fetcher } from './lib/fetcher.js'
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
            <SWRConfig
                value={{
                    fetcher
                }}
            >
                <BrowserRouter>
                    <Container>
                        <Menu />
                        <Routes>
                            <Route
                                index
                                loader={() => {
                                    if (this.state.loggedIn)
                                        redirect('/dashboard')
                                }}
                                element={<Home />}
                            />
                            <Route
                                path='/dashboard'
                                exact
                                loader={() => {
                                    if (!this.state.loggedIn) redirect('/login')
                                }}
                                element={<Dashboard />}
                            />
                            <Route
                                path='/devices'
                                loader={() => {
                                    if (!this.state.loggedIn) redirect('/login')
                                }}
                                element={
                                    <Devices
                                        user={this.state.user}
                                        roles={this.state.roles}
                                    />
                                }
                            />
                            <Route
                                path='/terminals'
                                loader={() => {
                                    if (!this.state.administrator)
                                        redirect('/dashboard')
                                }}
                                element={
                                    <Terminals
                                        user={this.state.user}
                                        roles={this.state.roles}
                                    />
                                }
                            />
                            <Route
                                path='/logging'
                                loader={() => {
                                    if (!this.state.administrator)
                                        redirect('/dashboard')
                                }}
                                element={
                                    <Logging
                                        user={this.state.user}
                                        roles={this.state.roles}
                                    />
                                }
                            />
                            <Route
                                path='/login'
                                loader={() => {
                                    if (this.state.loggedIn)
                                        redirect('/dashboard')
                                }}
                                element={<Login />}
                            />
                        </Routes>
                    </Container>
                </BrowserRouter>
            </SWRConfig>
        )
    }
}

export default App
