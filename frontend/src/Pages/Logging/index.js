import axios from 'axios'

import React, { Component } from 'react'

import { Row, Col } from 'react-bootstrap'

import LogLine from '../../Components/LogLine'

import CustomLogger from '../../lib/custom-logger'

const log = new CustomLogger('tacos:Pages:Logging')

const LogLines = ({ logs }) => {
    log.debug('LogLines', { logs })
    var LogLinesResult = logs.map(log => {
        return (
            <LogLine key={log.ts} log={log} />
        )
    })

    return LogLinesResult
}

class Logging extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...{
                logs: []
            }, ...props
        }
    }

    async componentDidMount() {
        let response = await axios('/api/logging')
        this.setState({ logs: response.data.data })
    }

    render() {
        return (
            <>
                <Row>
                    <Col>
                        <h1>Logs</h1>
                    </Col>
                </Row>
                <Row>
                    <Col md={2} lg={2} xl={2} className="d-xs-none d-sm-none d-md-block d-lg-block d-xl-block"><b>Timestamp</b></Col>
                    <Col className="d-xs-none d-sm-none d-md-block d-lg-block d-xl-block" md={1} lg={1} xl={1}><b>Level</b></Col>
                    <Col className="d-xs-none d-sm-none d-md-block d-lg-block d-xl-block" md={3} lg={3} xl={3}><b>Instance</b></Col>
                    <Col className="d-xs-none d-sm-none d-md-block d-lg-block d-xl-block" md={3} lg={3} xl={3}><b>Message</b></Col>
                    <Col className="d-xs-none d-sm-none d-md-block d-lg-block d-xl-block" md={3} lg={3} xl={3}><b>Data</b></Col>
                </Row>
                <LogLines logs={this.state.logs} />
            </>
        )
    }
}

export default Logging