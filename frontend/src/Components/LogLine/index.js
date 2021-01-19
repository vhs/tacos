import React, { Component } from 'react'

import { Row, Col } from 'react-bootstrap'
import TimeAgo from 'anderm-react-timeago'

class LogLine extends Component {
    render() {
        return (
            <Row>
                <Col xs={6} sm={6} className="d-md-none d-lg-none d-xl-none"><b>Timestamp</b></Col>
                <Col xs={6} sm={6} md={2} lg={2} xl={2}><TimeAgo date={this.props.log.ts} /></Col>
                <Col xs={6} sm={6} className="d-md-none d-lg-none d-xl-none"><b>Level</b></Col>
                <Col xs={6} sm={6} md={1} lg={1} xl={1}>{this.props.log.level}</Col>
                <Col xs={6} sm={6} className="d-md-none d-lg-none d-xl-none"><b>Instance</b></Col>
                <Col xs={6} sm={6} md={3} lg={3} xl={3}>{this.props.log.instance}</Col>
                <Col xs={12} sm={12} className="d-md-none d-lg-none d-xl-none"><b>Message</b></Col>
                <Col xs={12} sm={12} md={3} lg={3} xl={3}>{this.props.log.message}</Col>
                <Col xs={12} sm={12} className="d-md-none d-lg-none d-xl-none"><b>Data</b></Col>
                <Col xs={12} sm={12} md={3} lg={3} xl={3}>{JSON.stringify(this.props.log.data, null, '\t')}</Col>
            </Row>
        )
    }
}

export default LogLine