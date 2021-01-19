import React, { Component } from 'react'

class AuthenticatedElement extends Component {
    render() {
        return (
            <>
                {this.props.loggedIn ? this.props.children : null}
            </>
        )
    }
}

export default AuthenticatedElement