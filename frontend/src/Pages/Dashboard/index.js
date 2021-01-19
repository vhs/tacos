import React, { Component } from 'react'

import { Row, Col } from 'react-bootstrap'

class Dashboard extends Component {
    render() {
        return (
            <>
                <Row>
                    <Col>
                        <h1>Dashboard</h1>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <p>We're currently dumb and don't have any stats, but check out the devices and terminals pages!</p>
                    </Col>
                </Row>
            </>
        )
    }
}

export default Dashboard