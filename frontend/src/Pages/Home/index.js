import React, { Component } from 'react'

import { Row, Col } from 'react-bootstrap'

class Menu extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        return (
            <Row>
                <Col>
                    <h3>Welcome to TAC•OS!</h3>
                    <p>The Tool Access Control and Operations System</p>
                    <p>Please <a href="/login" className="btn btn-primary">Login</a> to unlock or manage tools!</p>
                </Col>
            </Row>
        )
    }
}

export default Menu