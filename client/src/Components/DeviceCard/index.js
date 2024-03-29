import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Row, Col, Form, FormControl, Button } from 'react-bootstrap'
import TimeAgo from 'anderm-react-timeago'
import { stateMachine } from 'pretty-state-machine'

import AdminElement from 'Components/AdminElement'

import CustomLogger from 'lib/custom-logger'
import apiService from 'services/api'

import './style.css'

const axios = apiService.getClient()

const log = new CustomLogger('tacos:Components:DeviceCard')

const timeoutWindow = 5000

const RoleOptions = ({ roles }) => {
  const RolesOptionsResult = roles.map((role) => {
    return <option key={role.code}>{role.code}</option>
  })

  return RolesOptionsResult
}

class DeviceCard extends Component {
  constructor (props) {
    super(props)

    log.debug('DeviceCard', props.device.id, 'props', props)

    this.intervalIds = {}
    this.timeoutIds = {}

    this.state = {
      ...{
        device: { armed: 0, role: '', description: '', lastSeen: '', id: '' },
        roles: [],
        user: stateMachine.get('user', { administrator: false, authenticated: false })
      },
      ...props
    }

    log.debug('DeviceCard', 'props', props)
  }

  componentDidMount () {
    this.refreshDevice()
  }

  componentWillUnmount () {
    for (const intervalId in this.intervalIds) {
      clearInterval(this.intervalIds[intervalId])
    }
    for (const timeoutId in this.timeoutIds) {
      clearTimeout(this.timeoutIds[timeoutId])
    }
  }

  async refreshDevice () {
    await this._getDevice()

    this.timeoutIds.refreshDevice = setTimeout(() => this.refreshDevice(), timeoutWindow + Math.random() * timeoutWindow)
  }

  async _getDevice () {
    const response = await axios.get(
      '/api/devices/details/' + this.state.device.id
    )

    log.debug('getDetails', 'response', response.data)

    this.setState({ device: response.data })
  }

  async _toggleDeviceHot () {
    let response

    if (this.state.device.armed === 0) {
      response = await axios.post('/api/devices/arm/' + this.props.device.id)
    } else {
      response = await axios.post('/api/devices/unarm/' + this.props.device.id)
    }

    this.setState({ device: response.data })
  }

  async _deleteDevice () {
    if (window.confirm('Are you sure?') === true) {
      const response = await axios.post(
        '/api/devices/delete/' + this.state.device.id
      )

      log.debug('deleteDevice', 'response', response.data)
    }
  }

  async _updateDescription (event) {
    const description = event.target.value

    log.debug('_updateDescription', 'description', description)

    const device = { ...this.state.device, ...{ description } }

    log.debug('_updateDescription', 'device', device)

    this.setState({ device })

    await axios.post(
      '/api/devices/update/description/' + this.state.device.id,
      { description }
    )

    return true
  }

  async _updateRole (event) {
    const role = event.target.value

    log.debug('_updateRole', 'role', role)

    const device = { ...this.state.device, ...{ role } }

    log.debug('_updateRole', 'device', device)

    this.setState({ device })

    await axios.post(
      '/api/devices/update/role/' + this.state.device.id,
      { role }
    )

    return true
  }

  render () {
    return (
      <Col xs={12} sm={12} md={6} lg={4} className='DeviceCard'>
        <Row className='spacious'>
          <Col>
            <Row className='tool-title'>
              <Col>
                <h3>{this.props.device.id}</h3>
              </Col>
            </Row>
            <Row className='spacious'>
              <Col xs='12' sm='12' md='4' lg='4'>
                <b>Description:</b>
              </Col>
              <Col xs='12' sm='12' md='8' lg='8'>
                {this.state.device.description}
              </Col>
            </Row>
            <AdminElement user={this.state.user}>
              <Row className='spacious'>
                <Col xs='12' sm='12' md='4' lg='4'>
                  <b> Description:</b>
                </Col>
                <Col>
                  <FormControl
                    id='DeviceId'
                    className='description-control'
                    type='input'
                    onChange={(e) => this._updateDescription(e)}
                    value={this.state.device.description}
                  />
                </Col>
              </Row>
              <Row className='spacious'>
                <Col xs='12' sm='12' md='4' lg='4'>
                  <b>Role:</b>
                </Col>
                <Col>
                  <Form.Group controlId='SelectRole'>
                    <Form.Control
                      as='select'
                      custom
                      value={this.state.device.role}
                      onChange={(e) => this._updateRole(e)}
                    >
                      <RoleOptions
                        roles={this.props.roles}
                      />
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </AdminElement>
            <Row className='spacious'>
              <Col xs='12' sm='12' md='4' lg='4'>
                <b>State:</b>
              </Col>
              <Col>
                <span className='powerstate pull-right'>
                  {this.state.device.armed
                    ? 'Armed'
                    : 'Unarmed'}
                </span>
              </Col>
            </Row>
            <Row className='spacious'>
              <Col xs='12' sm='12' md='4' lg='4'>
                <b>Last Seen:</b>
              </Col>
              <Col>
                <span className='pull-right'>
                  <TimeAgo date={this.props.device.last_seen} />
                </span>
              </Col>
            </Row>
            <Row className='spacious'>
              <Col>
                <AdminElement user={this.state.user}>
                  <Button
                    className='btn-danger'
                    onClick={(e) => this._deleteDevice(e)}
                  >
                    DELETE
                  </Button>
                </AdminElement>
              </Col>
              <Col></Col>
              <Col className='pull-right'>
                <Button
                  className='pull-right powerbutton'
                  onClick={(e) => this._toggleDeviceHot(e)}
                >
                  {this.state.device.armed === 0
                    ? 'ARM'
                    : 'DISARM'}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    )
  }
}

export default DeviceCard

DeviceCard.propTypes = {
  device: PropTypes.object,
  roles: PropTypes.array
}
