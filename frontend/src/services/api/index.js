import axios from 'axios'

import stateMachine from '../statemachine'

import CustomLogger from '../../lib/custom-logger'

var log = new CustomLogger('tacos:services:api')

class APIService {
    intervalIds

    constructor() {
        log.debug('start')
        this.intervalIds = {}
        this.getSession()
        this.getRoles()
        this.intervalIds.getSession = setInterval(this.getSession, 2000)
        this.intervalIds.rolesChecker = setInterval(this.getRoles, 2000)
    }

    getRoles() {
        log.debug('getRoles')
        axios.get('/api/roles')
            .then(function (response) {
                let data = response.data
                if (data.roles !== undefined) {
                    let newState = {
                        roles: data.roles
                    }
                    stateMachine.pub(newState)
                } else {
                    let newState = { roles: [] }
                    stateMachine.pub(newState)
                }
            })
            .catch((err) => {
                stateMachine.pub({ roles: [] })
            })
    }

    async getSession() {
        let response = await axios.get('/api/session')

        let data = response.data

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
    }
}

const apiService = new APIService()

export default apiService