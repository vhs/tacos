import { Col, Row } from 'react-bootstrap'
import { Navigate } from 'react-router'

import { useAuthentication } from '../../Components/AuthenticationProvider/AuthenticationHook.jsx'
import LogLine from '../../Components/LogLine/index.jsx'
import { useLogging } from '../../hooks/useLogging.jsx'
import CustomLogger from '../../lib/custom-logger'

const log = new CustomLogger('tacos:Pages:Logging')

const Logging = (props) => {
    const { hasLogs, logs } = useLogging()

    const { isAdministrator, isAuthenticated, isSessionLoading } =
        useAuthentication()

    if (isSessionLoading) return null

    if (!isAuthenticated && !isAdministrator) return <Navigate to='/' />

    return (
        <>
            <Row>
                <Col>
                    <h1>Logs</h1>
                </Col>
            </Row>
            <Row>
                <Col
                    md={2}
                    lg={2}
                    xl={2}
                    className='d-xs-none d-sm-none d-md-block d-lg-block d-xl-block'
                >
                    <b>Timestamp</b>
                </Col>
                <Col
                    className='d-xs-none d-sm-none d-md-block d-lg-block d-xl-block'
                    md={1}
                    lg={1}
                    xl={1}
                >
                    <b>Level</b>
                </Col>
                <Col
                    className='d-xs-none d-sm-none d-md-block d-lg-block d-xl-block'
                    md={3}
                    lg={3}
                    xl={3}
                >
                    <b>Instance</b>
                </Col>
                <Col
                    className='d-xs-none d-sm-none d-md-block d-lg-block d-xl-block'
                    md={3}
                    lg={3}
                    xl={3}
                >
                    <b>Message</b>
                </Col>
                <Col
                    className='d-xs-none d-sm-none d-md-block d-lg-block d-xl-block'
                    md={3}
                    lg={3}
                    xl={3}
                >
                    <b>Data</b>
                </Col>
            </Row>
            {hasLogs
                ? logs.map((log) => <LogLine key={log.ts} log={log} />)
                : ''}
        </>
    )
}

export default Logging
