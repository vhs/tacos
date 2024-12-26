import React from 'react'

import PropTypes from 'prop-types'

import CustomLogger from '../../lib/custom-logger'
import { useAuthentication } from '../AuthenticationProvider/AuthenticationHook.jsx'
import LoadingElement from '../LoadingElement/LoadingElement.jsx'

const log = new CustomLogger('tacos:Components:AdminElement')

const AdminElement = ({ children }) => {
    const { isAdministrator, isAuthenticated, isSessionLoading } =
        useAuthentication()

    if (isSessionLoading) return <LoadingElement />

    return isAuthenticated && isAdministrator ? children : null
}

export default AdminElement

AdminElement.propTypes = {
    children: PropTypes.any
}
