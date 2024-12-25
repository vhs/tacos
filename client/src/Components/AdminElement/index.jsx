import React from 'react'

import PropTypes from 'prop-types'

import CustomLogger from '../../lib/custom-logger'
import { useAuthenticationHook } from '../AuthenticationProvider/AuthenticationHook.jsx'

const log = new CustomLogger('tacos:Components:AdminElement')

const AdminElement = (props) => {
    const { isAdmin } = useAuthenticationHook()

    return <>{isAdmin ? props.children : null}</>
}

export default AdminElement

AdminElement.propTypes = {
    children: PropTypes.any
}
