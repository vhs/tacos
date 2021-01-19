import React, { Component } from 'react'
import { Link } from "react-router-dom";
import { Navbar, Nav, Button } from 'react-bootstrap'
import AdminElement from '../AdminElement'
import AuthenticatedElement from '../AuthenticatedElement'
import UserControlElement from '../UserControlElement'

import stateMachine from '../../services/statemachine'

import './style.css'

import CustomLogger from '../../lib/custom-logger'

var log = new CustomLogger('tacos:components:menu')

class Menu extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loggedIn: false,
            user: {}
        }
    }

    componentDidMount() {
        stateMachine.sub('loggedIn', this.setState.bind(this))
        stateMachine.sub('user', this.setState.bind(this))
    }

    render() {
        return (
            <Navbar expand="lg">
                <Navbar.Brand><Nav.Link to="/">TAC•OS</Nav.Link></Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Nav className="mr-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <AuthenticatedElement loggedIn={this.state.loggedIn}><Nav.Link as={Link} to="/devices">Devices</Nav.Link></AuthenticatedElement>
                        <AdminElement user={this.state.user}><Nav.Link as={Link} to="/terminals">Terminals</Nav.Link></AdminElement>
                        <AdminElement user={this.state.user}><Nav.Link as={Link} to="/logging">Logs</Nav.Link></AdminElement>
                    </Nav>
                    <Navbar.Text>
                        {this.state.loggedIn === true ? <UserControlElement user={this.state.user} /> : <Button id="LoginButton" href="/login">Login</Button>}
                    </Navbar.Text>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export default Menu