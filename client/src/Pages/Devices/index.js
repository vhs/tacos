import React, { Component } from 'react'

import { stateMachine } from 'pretty-state-machine'
import { Row, Col } from 'react-bootstrap'

import DeviceCard from 'Components/DeviceCard'
import Loading from 'Components/Loading'

import CustomLogger from 'lib/custom-logger'
import apiService from 'services/api'

const axios = apiService.getClient()

const log = new CustomLogger('tacos:Pages:Devices')

const DeviceCards = ({ devices, roles, user }) => {
  log.debug('DeviceCards', { devices, roles, user })
  const DeviceCardsResult = devices.map(device => {
    return (
      <DeviceCard key={device.id} device={device} roles={roles} user={user} />
    )
  })

  return DeviceCardsResult
}

class Devices extends Component {
  constructor (props) {
    super(props)
    this.intervals = {}

    this.state = {
      ...{
        devices: null,
        roles: stateMachine.get('roles', []),
        loading: true,
        loggedIn: stateMachine.get('loggedIn', false),
        user: stateMachine.get('user', { authenticated: false, administrator: false })
      },
      ...props
    }
  }

  async componentDidMount () {
    stateMachine.attach('loggedIn', this.setState.bind(this))
    stateMachine.attach('roles', this.setState.bind(this))
    stateMachine.attach('user', this.setState.bind(this))

    await this.getDevices()

    // this.intervals.getDevices = setInterval(this.getDevices.bind(this), 5000)
  }

  componentWillUnmount () {
    clearInterval(this.intervals.getDevices)
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.loading === true && (this.state.user !== undefined) && (this.state.user.administrator !== undefined) && this.state.device !== prevState.devices) {
      this.setState({ loading: false })
    }
  }

  async getDevices () {
    const response = await axios.get('/api/devices/')
    this.setState({ devices: response.data })
  }

  render () {
    return (
      <Loading loading={this.state.loading}>
        <Row>
          <Col>
            <h1>Devices</h1>
          </Col>
        </Row>
        <Row>
          {this.state.devices !== null && this.state.devices.length > 0 ? <DeviceCards devices={this.state.devices} roles={this.state.roles} user={this.state.user} /> : <span>Sorry! We can&apos;t find any devices at this time!</span>}
        </Row>
      </Loading>
    )
  }
}

export default Devices
