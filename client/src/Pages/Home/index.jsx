import { Col, Row } from 'react-bootstrap'
import { Navigate } from 'react-router'

import { useAuthentication } from '../../Components/AuthenticationProvider/AuthenticationHook.jsx'

const Menu = () => {
    const { isAuthenticated, isSessionLoading } = useAuthentication()

    if (isSessionLoading) return null

    if (isAuthenticated) return <Navigate to='/dashboard' />

    return (
        <Row>
            <Col>
                <h3>Welcome to TAC•OS!</h3>
                <p>The Tool Access Control and Operations System</p>
                <p>
                    Please{' '}
                    <a href='/login' className='btn btn-primary'>
                        Login
                    </a>{' '}
                    to unlock or manage tools!
                </p>
            </Col>
        </Row>
    )
}

export default Menu
