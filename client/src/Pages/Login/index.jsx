import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub'
import { faGoogle } from '@fortawesome/free-brands-svg-icons/faGoogle'
import { faSlackHash } from '@fortawesome/free-brands-svg-icons/faSlackHash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Col, Row } from 'react-bootstrap'
import { Navigate } from 'react-router'
import './style.css'

import { useAuthentication } from '../../Components/AuthenticationProvider/AuthenticationHook.jsx'

const Login = (props) => {
    const { isAuthenticated, isSessionLoading } = useAuthentication()

    if (isSessionLoading) return null

    if (isAuthenticated) return <Navigate to='/' />

    return (
        <>
            <Row className='spacious'>
                <Col>Login using one of the following providers:</Col>
            </Row>
            <Row className='centered spacious'>
                <Col>
                    <Button
                        id='GitHubLoginButton'
                        onClick={() => {
                            window.location.href = '/auth/github'
                        }}
                    >
                        <FontAwesomeIcon icon={faGithub} /> Login with Github
                    </Button>
                </Col>
                <Col>
                    <Button
                        id='GoogleLoginButton'
                        onClick={() => {
                            window.location.href = '/auth/google'
                        }}
                    >
                        <FontAwesomeIcon icon={faGoogle} /> Login with Google
                    </Button>
                </Col>
                <Col>
                    <Button
                        id='SlackLoginButton'
                        onClick={() => {
                            window.location.href = '/auth/slack'
                        }}
                    >
                        <FontAwesomeIcon icon={faSlackHash} /> Login with Slack
                    </Button>
                </Col>
            </Row>
            <Row className='spacious'>
                <Col>
                    To access TAC•OS, your membership account needs to be linked
                    to one of the providers above. You can link your membership
                    account below:
                    <br />
                    <a href='https://membership.vanhack.ca'>NOMOS</a>
                </Col>
            </Row>
        </>
    )
}

export default Login
