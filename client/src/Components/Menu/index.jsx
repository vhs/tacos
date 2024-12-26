import { clsx } from 'clsx'
import { Button, Nav, Navbar } from 'react-bootstrap'
import { Link, useLocation } from 'react-router'

import AdminElement from '../AdminElement/index.jsx'
import AuthenticatedElement from '../AuthenticatedElement/index.jsx'
import { useAuthentication } from '../AuthenticationProvider/AuthenticationHook.jsx'
import UserControlElement from '../UserControlElement/index.jsx'

import './style.css'

// import CustomLogger from 'lib/custom-logger'

// const log = new CustomLogger('tacos:components:menu')

const Menu = () => {
    const { user, isAuthenticated } = useAuthentication()

    const location = useLocation()

    return (
        <Navbar expand='lg'>
            <Navbar.Brand>
                <Nav.Link as={Link} to='/'>
                    TAC•OS
                </Nav.Link>{' '}
                ({process.env.NODE_ENV})
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className='justify-content-end'>
                <Nav className='mr-auto'>
                    <Nav.Link
                        as={Link}
                        to={isAuthenticated ? '/dashboard' : '/'}
                        className={clsx([
                            location.pathname === '/dashboard' ? 'active' : ''
                        ])}
                    >
                        Home
                    </Nav.Link>
                    <AuthenticatedElement>
                        <Nav.Link
                            as={Link}
                            to='/devices'
                            className={clsx([
                                location.pathname === '/devices' ? 'active' : ''
                            ])}
                        >
                            Devices
                        </Nav.Link>
                    </AuthenticatedElement>
                    <AdminElement>
                        <Nav.Link
                            as={Link}
                            to='/terminals'
                            className={clsx([
                                location.pathname === '/terminals'
                                    ? 'active'
                                    : ''
                            ])}
                        >
                            Terminals
                        </Nav.Link>
                    </AdminElement>
                    <AdminElement>
                        <Nav.Link
                            as={Link}
                            to='/logging'
                            className={clsx([
                                location.pathname === '/logging' ? 'active' : ''
                            ])}
                        >
                            Logs
                        </Nav.Link>
                    </AdminElement>
                </Nav>
                <Navbar.Text>
                    {isAuthenticated ? (
                        <UserControlElement user={user} />
                    ) : (
                        <Button id='LoginButton' href='/login'>
                            Login
                        </Button>
                    )}
                </Navbar.Text>
            </Navbar.Collapse>
        </Navbar>
    )
}

export default Menu
