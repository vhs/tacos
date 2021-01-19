import axios from 'axios'
import React, { Component } from 'react'
import { Row, Col, Form, FormControl, Button } from 'react-bootstrap'
import TimeAgo from 'anderm-react-timeago'

import './style.css'

import CustomLogger from '../../lib/custom-logger'

const log = new CustomLogger('tacos:Components:TerminalCard')

const TargetOptions = ({ targets }) => {
    var TargetsOptionsResult = targets.map(target => {
        return (
            <option key={target.id}>{target.id}</option>
        )
    })

    return TargetsOptionsResult
}

class TerminalCard extends Component {
    intervalIds

    constructor(props) {
        super(props)
        log.debug('TerminalCard', 'props', props)
        this.intervalIds = {}

        this.state = { ...{ terminal: {}, devices: [], targets: [], user: {} }, ...props }

        this.getTerminal = this._getTerminal.bind(this)
        this.deleteTerminal = this._deleteTerminal.bind(this)
        this.updateDescription = this._updateDescription.bind(this)
        this.updateEnabled = this._updateEnabled.bind(this)
        this.updateSecret = this._updateSecret.bind(this)
        this.updateTarget = this._updateTarget.bind(this)
    }

    componentDidMount() {
        this.intervalIds.getTerminal = setInterval(this.getTerminal.bind(this), 1000)
    }

    componentWillUnmount() {
        for (let intervalId in this.intervalIds) {
            clearInterval(this.intervalIds[intervalId])
        }
    }

    async _getTerminal() {
        let response = await axios.get('/api/terminals/details/' + this.state.terminal.id)

        log.debug('getTerminal', 'response', response.data)

        this.setState({ terminal: response.data })
    }

    async _terminalHot() {
        let response
        if (this.state.terminal.powered === 0)
            response = await axios.post('/api/terminals/arm/' + this.props.terminal.id)
        else
            response = await axios.post('/api/terminals/unarm/' + this.props.terminal.id)

        this.setState({ terminal: response.data })
    }

    async _deleteTerminal() {
        if (window.confirm("Are you sure?") === true) {
            let response = await axios.post('/api/terminals/delete/' + this.state.terminal.id)

            log.debug('deleteTerminal', 'response', response.data)
        }
    }

    async _updateDescription(event) {
        let description = event.target.value

        log.debug('_updateDescription', 'description', description)

        let terminal = { ...this.state.terminal, ...{ description } }

        log.debug('_updateDescription', 'terminal', terminal)


        this.setState({ terminal })

        let response = await axios.post('/api/terminals/update/description/' + this.state.terminal.id, { description })

        return true;
    }

    async _updateSecret(event) {
        let secret = event.target.value

        log.debug('_updateTarget', 'secret', secret)

        let terminal = { ...this.state.terminal, ...{ secret } }

        log.debug('_updateTarget', 'terminal', terminal)

        this.setState({ terminal })

        let response = await axios.post('/api/terminals/update/secret/' + this.state.terminal.id, { secret })

        return true;
    }

    async _updateTarget(event) {
        let target = event.target.value

        log.debug('_updateTarget', 'target', target)

        let terminal = { ...this.state.terminal, ...{ target } }

        log.debug('_updateTarget', 'terminal', terminal)

        this.setState({ terminal })

        let response = await axios.post('/api/terminals/update/target/' + this.state.terminal.id, { target })

        return true;
    }

    async _updateEnabled(event) {
        let enabled = event.target.checked ? 1 : 0

        log.debug('_updateEnabled', 'enabled', enabled)

        let terminal = { ...this.state.terminal, ...{ enabled } }

        log.debug('_updateEnabled', 'terminal', terminal)

        this.setState({ terminal })

        let response = await axios.post('/api/terminals/update/enabled/' + this.state.terminal.id, { enabled })

        log.debug('_updateEnabled', response)

        return true;
    }

    render() {
        return (
            <Col xs="12" sm="12" md="6" lg="6" className="TerminalCard">
                <Row className="spacious">
                    <Col>
                        <Row className="tool-title">
                            <Col>
                                <h3>{this.props.terminal.id}</h3>
                            </Col>
                        </Row>
                        <Row className="spacious">
                            <Col>
                                <b> Description:</b>
                            </Col>
                            <Col>
                                <FormControl id="TerminalId" className="description-control" type="input" onChange={this.updateDescription} value={this.state.terminal.description} />
                            </Col>
                        </Row>
                        <Row className="spacious">
                            <Col>
                                <b>Enabled:</b>
                            </Col>
                            <Col>
                                <Form.Check type="checkbox" checked={this.state.terminal.enabled === 1 ? true : false} label={this.state.terminal.enabled === 1 ? 'Enabled' : 'Disabled'} onChange={this.updateEnabled} />
                            </Col>
                        </Row>
                        <Row className="spacious">
                            <Col>
                                <b>Target:</b>
                            </Col>
                            <Col>
                                <Form.Group controlId="SelectTarget">
                                    <Form.Control as="select" custom value={this.state.terminal.target || '---'} onChange={this.updateTarget}>
                                        <option>---</option>
                                        <TargetOptions targets={this.state.devices} />
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="spacious">
                            <Col>
                                <b>Secure:</b>
                            </Col>
                            <Col>
                                <span className="securestate">{this.state.terminal.secure ? 'Secured' : 'Not secured'}</span>
                            </Col>
                        </Row>
                        <Row className="spacious">
                            <Col>
                                <b> Secret:</b>
                            </Col>
                            <Col>
                                <FormControl id="TerminalSecret" className="description-control" type="password" onChange={this.updateSecret} value={this.state.terminal.secret} />
                            </Col>
                        </Row>
                        <Row className="spacious">
                            <Col>
                                <b>Last Seen:</b>
                            </Col>
                            <Col>
                                <TimeAgo date={this.props.terminal.last_seen} />
                            </Col>
                        </Row>
                        <Row className="spacious">
                            <Col>
                                <Button className="btn-danger" onClick={this.deleteTerminal}>DELETE</Button>
                            </Col>
                            <Col>&nbsp;</Col>
                            <Col className="pull-right">
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
        )
    }
}

export default TerminalCard