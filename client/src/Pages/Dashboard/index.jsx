import { Col, Row } from 'react-bootstrap'
import { Navigate } from 'react-router'

import { useAuthentication } from '../../Components/AuthenticationProvider/AuthenticationHook.jsx'

const Dashboard = () => {
    const { isAuthenticated, isSessionLoading } = useAuthentication()

    if (isSessionLoading) return null

    if (!isAuthenticated) return <Navigate to='/' />

    return (
        <>
            <Row>
                <Col>
                    <h1>Dashboard</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <p>
                        We&apos;re currently dumb and don&apos;t have any stats,
                        but check out the devices and terminals pages!
                    </p>
                </Col>
            </Row>
        </>
    )
}

export default Dashboard
