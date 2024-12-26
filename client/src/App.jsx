import 'bootstrap/dist/css/bootstrap.min.css'

import { Container } from 'react-bootstrap'
import { BrowserRouter, redirect, Route, Routes } from 'react-router'
import { ToastContainer } from 'react-toastify'

import { useAuthentication } from './Components/AuthenticationProvider/AuthenticationHook.jsx'
import Loading from './Components/Loading/index.jsx'
import Menu from './Components/Menu/index.jsx'
import CustomLogger from './lib/custom-logger/index.js'
import Dashboard from './Pages/Dashboard/index.jsx'
import Devices from './Pages/Devices/index.jsx'
import Home from './Pages/Home/index.jsx'
import Logging from './Pages/Logging/index.jsx'
import Login from './Pages/Login/index.jsx'
import Terminals from './Pages/Terminals/index.jsx'

import './App.css'

const log = new CustomLogger('tacos:app')

const App = (props) => {
    const { administrator, isAuthenticated, isSessionLoading } =
        useAuthentication()

    if (isSessionLoading) return <Loading />

    return (
        <BrowserRouter>
            <Container>
                <Menu />
                <Routes>
                    <Route
                        index
                        loader={() => {
                            if (isAuthenticated) redirect('/dashboard')
                        }}
                        element={<Home />}
                    />
                    <Route
                        path='/dashboard'
                        exact
                        loader={() => {
                            if (!isAuthenticated) redirect('/login')
                        }}
                        element={<Dashboard />}
                    />
                    <Route
                        path='/devices'
                        loader={() => {
                            if (!isAuthenticated) redirect('/login')
                        }}
                        element={<Devices />}
                    />
                    <Route
                        path='/terminals'
                        loader={() => {
                            if (!administrator) redirect('/dashboard')
                        }}
                        element={<Terminals />}
                    />
                    <Route
                        path='/logging'
                        loader={() => {
                            if (!administrator) redirect('/dashboard')
                        }}
                        element={<Logging />}
                    />
                    <Route
                        path='/login'
                        loader={() => {
                            if (isAuthenticated) redirect('/dashboard')
                        }}
                        element={<Login />}
                    />
                </Routes>
                <ToastContainer />
            </Container>
        </BrowserRouter>
    )
}

export default App
