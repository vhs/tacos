import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { stateMachine } from 'pretty-state-machine'

import apiService from 'services/api'

const axios = apiService.getClient()

class UserControlElement extends Component {
  constructor (props) {
    super(props)
    this.state = { ...{}, ...props }
  }

  async doLogout () {
    if (window.confirm('Are you sure?')) {
      const response = await axios.get('/auth/logout')

      if (response.status === 200 && response.data.result === 'OK') {
        stateMachine.pub({ loggedIn: false, user: {} })
        stateMachine.pub('loggedIn', false)
        stateMachine.pub('user', {})
      }

      return response
    }
  }

  render () {
    return (
      <>
        Signed in as: <b><i>{this.state.user.username}</i></b> {this.state.user.administrator ? ' (Admin)' : ''}&nbsp;<Button className="btn-sm fill-out" onClick={() => this.doLogout()}>Logout</Button>
      </>
    )
  }
}

export default UserControlElement
