import 'bootstrap/dist/css/bootstrap.min.css'

import { Container } from 'react-bootstrap'
import { BrowserRouter, Route, Routes } from 'react-router'
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
    const { isSessionLoading } = useAuthentication()

    return (
        <BrowserRouter>
            <Loading loading={isSessionLoading}>
                <Container>
                    <Menu />
                    <Routes>
                        <Route index element={<Home />} />

                        <Route path='/dashboard' element={<Dashboard />} />

                        <Route path='/devices' element={<Devices />} />
                        <Route path='/terminals' element={<Terminals />} />
                        <Route path='/logging' element={<Logging />} />
                        <Route path='/login' element={<Login />} />
                    </Routes>
                </Container>
            </Loading>
            <ToastContainer />
        </BrowserRouter>
    )
}

export default App
