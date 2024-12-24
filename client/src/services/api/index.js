import axios from 'axios'

import { stateMachine } from 'pretty-state-machine'

import CustomLogger from '../../lib/custom-logger/'

const log = new CustomLogger('tacos:services:api')

class APIService {
    constructor() {
        log.debug('start')

        this.state = {
            user: stateMachine.get('user', { authenticated: false }),
            loggedIn: stateMachine.get('loggedIn', false)
        }

        this.client = axios

        this.getSession()
        this.getRoles()

        this.intervalIds = {}
        this.intervalIds.rolesChecker = setInterval(
            () => this.getRoles(),
            15000
        )
        this.intervalIds.sessionChecker = setInterval(
            () => this.getSession(),
            15000
        )
    }

    getClient() {
        return this.client
    }

    async getRoles() {
        log.debug('getRoles', 'run')

        log.debug('getRoles', 'state:', this.state)

        if (this.state.loggedIn === true) {
            try {
                const result = await this.client.get('/api/roles')

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
                log.error('getRoles', err)
                stateMachine.pub({ roles: [] })
            }
        } else {
            log.debug('getRoles', 'Not logged in')
        }
    }

    async getSession() {
        log.debug('getSession', 'run')

        try {
            const response = await this.client.get('/api/session')

            const data = response.data

            log.debug('getSession', 'data:', data)

            let newState = { user: { authenticated: false }, loggedIn: false }

            if (data.user !== undefined) {
                newState = {
                    ...this.state,
                    ...{
                        user: data.user,
                        loggedIn: data.user.authenticated
                    }
                }
            }

            newState = { ...this.state, ...newState }

            this.state = newState

            stateMachine.pub(newState)

            return newState
        } catch (err) {
            log.debug('getSession', 'err:', err)
        }
    }
}

const apiService = new APIService()

export default apiService
