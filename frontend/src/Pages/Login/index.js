import stateMachine from '../../services/statemachine'

import React, { Component } from 'react'
import { Row, Col, Button } from 'react-bootstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
// import { faGithub, faGoogle } from '@fortawesome/free-solid-svg-icons'
// library.add(fab, faGithub, faGoogle)

import './style.css'

library.add(fab)


class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        return (
            <>
                <Row className="spacious">
                    <Col>
                        Login using one of the following providers:
                </Col>
                </Row>
                <Row className="centered spacious">
                    <Col>
                        <Button id="GitHubLoginButton" onClick={() => window.location.href = '/auth/github'}><FontAwesomeIcon icon={['fab', 'github']} /> Login with Github</Button>
                    </Col>
                    <Col>
                        <Button id="GoogleLoginButton" onClick={() => window.location.href = '/auth/google'}><FontAwesomeIcon icon={['fab', 'google']} /> Login with Google</Button>
                    </Col>
                    <Col>
                        <Button id="SlackLoginButton" onClick={() => window.location.href = '/auth/slack'}><FontAwesomeIcon icon={['fab', 'slack-hash']} /> Login with Slack</Button>
                    </Col>
                </Row>
                <Row className="spacious">
                    <Col>
                        To access TAC•OS, your membership account needs to be linked to one of the providers above. You can link your membership account below:<br />
                        <a href="https://membership.vanhack.ca">NOMOS</a>
                    </Col>
                </Row>
            </>
        )
    }
}

export default Login