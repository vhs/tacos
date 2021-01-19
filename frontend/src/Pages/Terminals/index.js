import axios from 'axios'

import React, { Component } from 'react'

import stateMachine from '../../services/statemachine'

import { Row, Col } from 'react-bootstrap'

import TerminalCard from '../../Components/TerminalCard'
import Loading from '../../Components/Loading'

import CustomLogger from '../../lib/custom-logger'

const log = new CustomLogger('tacos:Pages:Terminals')

const TerminalCards = ({ terminals, devices, roles, user }) => {
    var TerminalCardsResult = terminals.map(terminal => {
        return (
            <TerminalCard key={terminal.id} terminal={terminal} devices={devices} roles={roles} user={user} />
        )
    })

    return TerminalCardsResult
}

class Terminals extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...{
                devices: [],
                terminals: [],
                loading: true,
                user: { authenticated: false, administrator: false },
                loggedIn: false
            }, ...props
        }
    }

    componentDidMount() {
        this.getDevices()
        this.getTerminals()
        setInterval(this.getDevices.bind(this), 5000)
        setInterval(this.getTerminals.bind(this), 5000)

        stateMachine.attach('loggedIn', this.setState.bind(this))
        stateMachine.attach('user', this.setState.bind(this))
        stateMachine.attach('roles', this.setState.bind(this))

        this.setState({ loading: false })
    }

    async getDevices() {
        let response = await axios.get('/api/devices/')
        log.debug('getDevices', response.data)
        this.setState({ devices: response.data })
    }

    async getTerminals() {
        let response = await axios.get('/api/terminals/')
        log.debug('getTerminals', response.data)
        this.setState({ terminals: response.data })
    }

    render() {
        return (
            <Loading loading={this.state.loading}>
                <Row>
                    <Col>
                        <h1>Terminals</h1>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {this.state.terminals.length > 0 ? <TerminalCards terminals={this.state.terminals} devices={this.state.devices} roles={this.state.roles} user={this.state.user} /> : <span>Sorry! We can't find any terminals at this time!</span>}
                    </Col>
                </Row>
            </Loading>
        )
    }
}

export default Terminals