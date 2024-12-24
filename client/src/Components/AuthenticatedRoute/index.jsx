import React, { Component } from 'react'

import { stateMachine } from 'pretty-state-machine'
import PropTypes from 'prop-types'

class AuthenticatedRoute extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loggedIn: stateMachine.get('loggedIn', false)
        }
    }

    componentDidMount() {
        stateMachine.attach('loggedIn', this.setState.bind(this))
    }

    render() {
        return <>{this.state.loggedIn ? this.props.children : null}</>
    }
}

export default AuthenticatedRoute

AuthenticatedRoute.propTypes = {
    loggedIn: PropTypes.bool,
    children: PropTypes.any.isRequired
}

AuthenticatedRoute.defaultProps = {
    loggedIn: false
}
