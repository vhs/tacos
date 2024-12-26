import React from 'react'

import PropTypes from 'prop-types'

import CustomLogger from '../../lib/custom-logger'
import { useAuthentication } from '../AuthenticationProvider/AuthenticationHook.jsx'

const log = new CustomLogger('tacos:Components:AdminElement')

const AdminElement = ({ children }) => {
    const { isAdmin } = useAuthentication()

    return <>{isAdmin ? children : null}</>
}

export default AdminElement

AdminElement.propTypes = {
    children: PropTypes.any
}
