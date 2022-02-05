import axios from 'axios'

import { stateMachine } from 'pretty-state-machine'

import CustomLogger from '../../lib/custom-logger'

const log = new CustomLogger('tacos:services:api')

class APIService {
  constructor () {
    log.debug('start')
    this.intervalIds = {}
    this.getSession()
    this.getRoles()
    this.intervalIds.getSession = setInterval(this.getSession, 2000)
    this.intervalIds.rolesChecker = setInterval(this.getRoles, 2000)
  }

  async getRoles () {
    log.debug('getRoles')

    try {
      const result = await axios.get('/api/roles')

      const data = result.data
      if (data.roles !== undefined) {
        const newState = {
          roles: data.roles
        }
        stateMachine.pub(newState)
      } else {
        stateMachine.pub({ roles: [] })
      }
    } catch (err) {
      stateMachine.pub({ roles: [] })
    }
  }

  async getSession () {
    try {
      const response = await axios.get('/api/session')

      const data = response.data

      let newState = { user: { authenticated: false }, loggedIn: false }

      if (data.user !== undefined) {
        newState = {
          ...newState,
          ...{
            user: data.user,
            loggedIn: data.user.authenticated
          }
        }
      }

      stateMachine.pub(newState)

      return newState
    } catch (err) {

    }
  }
}

const apiService = new APIService()

export default apiService
