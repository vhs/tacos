import axios from 'axios'
import React, { Component } from 'react'
import { Row, Col, Form, FormControl, Button } from 'react-bootstrap'
import TimeAgo from 'anderm-react-timeago'

import stateMachine from '../../services/statemachine'

import AdminElement from '../AdminElement'

import './style.css'

import CustomLogger from '../../lib/custom-logger'

const log = new CustomLogger('tacos:Components:DeviceCard')

const RoleOptions = ({ roles }) => {
    var RolesOptionsResult = roles.map(role => {
        return (
            <option key={role.code}>{role.code}</option>
        )
    })

    return RolesOptionsResult
}

class DeviceCard extends Component {
    intervalIds

    constructor(props) {
        super(props)
        log.debug('DeviceCard', 'props', props)
        this.intervalIds = {}
        this.state = { ...{ device: {}, roles: [], user: { administrator: false, authenticated: false } }, ...props }
        log.debug('DeviceCard', 'state', this.state)
        this.deviceHot = this._deviceHot.bind(this)
        this.getDevice = this._getDevice.bind(this)
        this.deleteDevice = this._deleteDevice.bind(this)
        this.updateDescription = this._updateDescription.bind(this)
        this.updateRole = this._updateRole.bind(this)
    }

    componentDidMount() {
        this.intervalIds.getDevice = setInterval(this.getDevice, 1000)
        let newUserState = stateMachine.fetch('user', { administrator: false, authenticated: false })
        log.debug('componentDidMount', 'newUserState', newUserState)
        this.setState(newUserState)
    }

    componentWillUnmount() {
        for (let intervalId in this.intervalIds) {
            clearInterval(this.intervalIds[intervalId])
        }
    }

    async _getDevice() {
        let response = await axios.get('/api/devices/details/' + this.state.device.id)

        log.debug('getDetails', 'response', response.data)

        this.setState({ device: response.data })
    }

    async _deviceHot() {
        let response
        if (this.state.device.powered === 0)
            response = await axios.post('/api/devices/arm/' + this.props.device.id)
        else
            response = await axios.post('/api/devices/unarm/' + this.props.device.id)

        this.setState({ device: response.data })
    }

    async _deleteDevice() {
        if (window.confirm("Are you sure?") === true) {
            let response = await axios.post('/api/devices/delete/' + this.state.device.id)

            log.debug('deleteDevice', 'response', response.data)

        }
    }

    async _updateDescription(event) {
        let description = event.target.value

        log.debug('_updateDescription', 'description', description)

        let device = { ...this.state.device, ...{ description } }

        log.debug('_updateDescription', 'device', device)


        this.setState({ device })

        let response = await axios.post('/api/devices/update/description/' + this.state.device.id, { description })

        return true;
    }

    async _updateRole(event) {
        let role = event.target.value

        log.debug('_updateRole', 'role', role)

        let device = { ...this.state.device, ...{ role } }

        log.debug('_updateRole', 'device', device)

        this.setState({ device })

        let response = await axios.post('/api/devices/update/role/' + this.state.device.id, { role })

        return true;
    }

    render() {
        return (
            <Col xs={12} sm={12} md={6} lg={4} className="DeviceCard">
                <Row className="spacious">
                    <Col>
                        <Row className="tool-title">
                            <Col>
                                <h3>{this.props.device.id}</h3>
                            </Col>
                        </Row>
                        <Row className="spacious">
                            <Col xs="12" sm="12" md="4" lg="4">
                                <b>Description:</b>
                            </Col>
                            <Col xs="12" sm="12" md="8" lg="8">
                                {this.state.device.description}
                            </Col>
                        </Row>
                        <AdminElement user={this.state.user}>
                            <Row className="spacious">
                                <Col xs="12" sm="12" md="4" lg="4">
                                    <b> Description:</b>
                                </Col>
                                <Col>
                                    <FormControl id="DeviceId" className="description-control" type="input" onChange={this.updateDescription} value={this.state.device.description} />
                                </Col>
                            </Row>
                            <Row className="spacious">
                                <Col xs="12" sm="12" md="4" lg="4">
                                    <b>Role:</b>
                                </Col>
                                <Col>
                                    <Form.Group controlId="SelectRole">
                                        <Form.Control as="select" custom value={this.state.device.role} onChange={this.updateRole}>
                                            <RoleOptions roles={this.props.roles} />
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </AdminElement>
                        <Row className="spacious">
                            <Col xs="12" sm="12" md="4" lg="4">
                                <b>State:</b>
                            </Col>
                            <Col>
                                <span className="powerstate">{this.state.device.powered ? 'Armed' : 'Unarmed'}</span>
                            </Col>
                        </Row>
                        <Row className="spacious">
                            <Col xs="12" sm="12" md="4" lg="4">
                                <b>Last Seen:</b>
                            </Col>
                            <Col>
                                <TimeAgo date={this.props.device.last_seen} />
                            </Col>
                        </Row>
                        <Row className="spacious">
                            <Col>
                                <AdminElement user={this.state.user}><Button className="btn-danger" onClick={this.deleteDevice}>DELETE</Button></AdminElement>
                            </Col>
                            <Col>
                            </Col>
                            <Col className="pull-right">
                                <Button className="pull-right powerbutton" onClick={this.deviceHot}>{this.state.device.powered === 0 ? "ARM" : "DISARM"}</Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
        )
    }
}

export default DeviceCard