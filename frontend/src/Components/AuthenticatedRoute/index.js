import React, { Component } from 'react'

import stateMachine from '../../services/statemachine'

class AuthenticatedRoute extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
        stateMachine.attach('loggedIn', this.setState.bind(this))
    }

    render() {
        return (
            <>
                {this.state.loggedIn ? this.props.children : null}
            </>
        )
    }
}

export default AuthenticatedRoute