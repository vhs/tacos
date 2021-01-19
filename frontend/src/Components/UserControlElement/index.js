import axios from 'axios'

import React, { Component } from 'react'

import { Button } from 'react-bootstrap'

class UserControlElement extends Component {
    constructor(props) {
        super(props)
        this.state = { ...{}, ...props }
    }

    async doLogout() {
        if (window.confirm("Are you sure?")) {
            let response = axios.get('/auth/logout')
            return response
        }
    }

    render() {
        return (
            <>
                Signed in as: <b><i>{this.state.user.username}</i></b> {this.state.user.administrator ? " (Admin)" : ''}&nbsp;<Button onClick={this.doLogout}>Logout</Button>
            </>
        )
    }
}

export default UserControlElement