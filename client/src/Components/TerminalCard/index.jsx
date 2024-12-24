import { Component } from 'react'

import TimeAgo from 'anderm-react-timeago'
import PropTypes from 'prop-types'
import { Button, Col, Form, FormControl, Row } from 'react-bootstrap'

import CustomLogger from '../../lib/custom-logger'
import apiService from '../../services/api'

import './style.css'

const axios = apiService.getClient()

const log = new CustomLogger('tacos:Components:TerminalCard')

const TargetOptions = ({ targets }) => {
    const TargetsOptionsResult = targets.map((target) => {
        return <option key={target.id}>{target.id}</option>
    })

    return TargetsOptionsResult
}

class TerminalCard extends Component {
    constructor(props) {
        super(props)
        log.debug('TerminalCard', 'props', props)
        this.intervalIds = {}

        this.state = {
            ...{ terminal: {}, devices: [], targets: [], user: {} },
            ...props
        }

        this.getTerminal = this._getTerminal.bind(this)
        this.deleteTerminal = this._deleteTerminal.bind(this)
        this.updateDescription = this._updateDescription.bind(this)
        this.updateEnabled = this._updateEnabled.bind(this)
        this.updateSecret = this._updateSecret.bind(this)
        this.updateTarget = this._updateTarget.bind(this)
    }

    componentDidMount() {
        this.intervalIds.getTerminal = setInterval(
            this.getTerminal.bind(this),
            5000
        )
    }

    componentWillUnmount() {
        for (const intervalId in this.intervalIds) {
            clearInterval(this.intervalIds[intervalId])
        }
    }

    async _getTerminal() {
        const response = await axios.get(
            '/api/terminals/details/' + this.state.terminal.id
        )

        log.debug('getTerminal', 'response', response.data)

        this.setState({ terminal: response.data })
    }

    async _terminalHot() {
        let response
        if (this.state.terminal.armed === 0) {
            response = await axios.post(
                '/api/terminals/arm/' + this.props.terminal.id
            )
        } else {
            response = await axios.post(
                '/api/terminals/unarm/' + this.props.terminal.id
            )
        }

        this.setState({ terminal: response.data })
    }

    async _deleteTerminal() {
        if (window.confirm('Are you sure?') === true) {
            const response = await axios.post(
                '/api/terminals/delete/' + this.state.terminal.id
            )

            log.debug('deleteTerminal', 'response', response.data)
        }
    }

    async _updateDescription(event) {
        const description = event.target.value

        log.debug('_updateDescription', 'description', description)

        const terminal = { ...this.state.terminal, ...{ description } }

        log.debug('_updateDescription', 'terminal', terminal)

        this.setState((currentState) => ({
            terminal: {
                ...currentState.terminal,
                description
            }
        }))

        await axios.post(
            '/api/terminals/update/description/' + this.state.terminal.id,
            { description }
        )

        return true
    }

    async _updateSecret(event) {
        const secret = event.target.value

        log.debug('_updateTarget', 'secret', secret)

        const terminal = { ...this.state.terminal, ...{ secret } }

        log.debug('_updateTarget', 'terminal', terminal)

        this.setState({ terminal })

        await axios.post(
            '/api/terminals/update/secret/' + this.state.terminal.id,
            { secret }
        )

        return true
    }

    async _updateTarget(event) {
        const target = event.target.value

        log.debug('_updateTarget', 'target', target)

        const terminal = { ...this.state.terminal, ...{ target } }

        log.debug('_updateTarget', 'terminal', terminal)

        this.setState({ terminal })

        await axios.post(
            '/api/terminals/update/target/' + this.state.terminal.id,
            { target }
        )

        return true
    }

    async _updateEnabled(event) {
        const enabled = event.target.checked ? 1 : 0

        log.debug('_updateEnabled', 'enabled', enabled)

        const terminal = { ...this.state.terminal, ...{ enabled } }

        log.debug('_updateEnabled', 'terminal', terminal)

        this.setState({ terminal })

        const response = await axios.post(
            '/api/terminals/update/enabled/' + this.state.terminal.id,
            { enabled }
        )

        log.debug('_updateEnabled', response)

        return true
    }

    render() {
        return (
            <Col xs='12' sm='12' md='6' lg='6' className='TerminalCard'>
                <Row className='spacious'>
                    <Col>
                        <Row className='tool-title'>
                            <Col>
                                <h3>{this.props.terminal.id}</h3>
                            </Col>
                        </Row>
                        <Row className='spacious'>
                            <Col>
                                <b> Description:</b>
                            </Col>
                            <Col>
                                <FormControl
                                    id='TerminalId'
                                    className='description-control'
                                    type='input'
                                    onChange={this.updateDescription}
                                    value={this.state.terminal.description}
                                />
                            </Col>
                        </Row>
                        <Row className='spacious'>
                            <Col>
                                <b>Enabled:</b>
                            </Col>
                            <Col>
                                <Form.Check
                                    type='checkbox'
                                    checked={this.state.terminal.enabled === 1}
                                    label={
                                        this.state.terminal.enabled === 1
                                            ? 'Enabled'
                                            : 'Disabled'
                                    }
                                    onChange={this.updateEnabled}
                                />
                            </Col>
                        </Row>
                        <Row className='spacious'>
                            <Col>
                                <b>Target:</b>
                            </Col>
                            <Col>
                                <Form.Group controlId='SelectTarget'>
                                    <Form.Control
                                        as='select'
                                        custom
                                        value={
                                            this.state.terminal.target || '---'
                                        }
                                        onChange={this.updateTarget}
                                    >
                                        <option>---</option>
                                        <TargetOptions
                                            targets={this.state.devices}
                                        />
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className='spacious'>
                            <Col>
                                <b>Secure:</b>
                            </Col>
                            <Col>
                                <span className='securestate'>
                                    {this.state.terminal.secure
                                        ? 'Secured'
                                        : 'Not secured'}
                                </span>
                            </Col>
                        </Row>
                        <Row className='spacious'>
                            <Col>
                                <b> Secret:</b>
                            </Col>
                            <Col>
                                <FormControl
                                    id='TerminalSecret'
                                    className='description-control'
                                    type='password'
                                    onChange={this.updateSecret}
                                    value={this.state.terminal.secret}
                                />
                            </Col>
                        </Row>
                        <Row className='spacious'>
                            <Col>
                                <b>Last Seen:</b>
                            </Col>
                            <Col>
                                <TimeAgo date={this.props.terminal.last_seen} />
                            </Col>
                        </Row>
                        <Row className='spacious'>
                            <Col>
                                <Button
                                    className='btn-danger'
                                    onClick={this.deleteTerminal}
                                >
                                    DELETE
                                </Button>
                            </Col>
                            <Col>&nbsp;</Col>
                            <Col className='pull-right'></Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
        )
    }
}

export default TerminalCard

TerminalCard.propTypes = {
    terminal: PropTypes.object
}
