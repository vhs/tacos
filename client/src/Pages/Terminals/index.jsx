import React, { Component } from 'react'

import { stateMachine } from 'pretty-state-machine'
import { Row, Col } from 'react-bootstrap'

import Conditional from '../../Components/Conditional/Conditional.jsx'
import LoadingElement from '../../Components/LoadingElement/LoadingElement.jsx'
import TerminalCard from '../../Components/TerminalCard/index.jsx'
import CustomLogger from '../../lib/custom-logger'
import apiService from '../../services/api'

const axios = apiService.getClient()

const log = new CustomLogger('tacos:Pages:Terminals')

const TerminalCards = ({ terminals, devices, roles, user }) => {
    const TerminalCardsResult = terminals.map((terminal) => {
        return (
            <TerminalCard
                key={terminal.id}
                terminal={terminal}
                devices={devices}
                roles={roles}
                user={user}
            />
        )
    })

    return TerminalCardsResult
}

class Terminals extends Component {
    constructor(props) {
        log.debug('constructor')
        super(props)
        this.state = {
            loading: true,
            ...{
                devices: null,
                terminals: null,
                loading: true,
                user: stateMachine.get('user', {
                    authenticated: false,
                    administrator: false
                }),
                loggedIn: stateMachine.get('loggedIn', false)
            },
            ...props
        }
    }

    async componentDidMount() {
        log.debug('componentDidMount')

        stateMachine.attach('loggedIn', this.setState.bind(this))
        stateMachine.attach('user', this.setState.bind(this))
        stateMachine.attach('roles', this.setState.bind(this))

        log.debug('componentDidMount', 'calling getDevices')
        await this.getDevices()
        log.debug('componentDidMount', 'calling getTerminals')
        await this.getTerminals()

        log.debug('componentDidMount', 'setting up intervals')
        setInterval(() => this.getDevices(), 5000)
        setInterval(() => this.getTerminals(), 5000)
    }

    componentDidUpdate(prevProps, prevState) {
        // if (prevState.loading !== this.state.loading) {
        log.debug(
            'componentDidUpdate',
            'loading',
            prevState.loading,
            '->',
            this.state.loading
        )
        // }
        log.debug(
            'componentDidUpdate',
            'devices',
            prevState.devices,
            '->',
            this.state.devices
        )
        log.debug(
            'componentDidUpdate',
            'terminals',
            prevState.terminals,
            '->',
            this.state.terminals
        )
    }

    async getDevices() {
        const response = await axios.get('/api/devices/')
        const devices = response.data
        log.debug('getDevices', 'devices:', devices)
        this.setState({ devices })
        this.setState((prevState) =>
            this.isReady({ ...prevState, ...{ devices } })
                ? { loading: false }
                : { loading: true }
        )

        return true
    }

    async getTerminals() {
        log.debug('getTerminals', 'called')
        try {
            const response = await axios.get('/api/terminals/')
            const terminals = response.data
            log.debug('getTerminals', 'terminals:', terminals)
            this.setState({ terminals })
            this.setState((prevState) =>
                this.isReady({ ...prevState, ...{ terminals } })
                    ? { loading: false }
                    : { loading: true }
            )

            return true
        } catch (err) {
            log.error('getTerminals', 'error:', err)
        }
    }

    isReady({ devices, terminals }) {
        return devices === null || terminals === null
            ? false
            : !Array.isArray(devices) || !Array.isArray(terminals)
              ? false
              : !(devices.length === 0 || terminals.length === 0)
    }

    render() {
        const { loading, devices, terminals, roles, user } = this.state

        return (
            <>
                <Row>
                    <Col>
                        <h1>Terminals</h1>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Conditional condition={loading === true}>
                            <LoadingElement />
                        </Conditional>
                        <Conditional condition={loading === false}>
                            {terminals !== null && terminals.length > 0 ? (
                                <TerminalCards
                                    terminals={terminals}
                                    devices={devices}
                                    roles={roles}
                                    user={user}
                                />
                            ) : (
                                <span>
                                    Sorry! We can&apos;t find any terminals at
                                    this time!
                                </span>
                            )}
                        </Conditional>
                    </Col>
                </Row>
            </>
        )
    }
}

export default Terminals
