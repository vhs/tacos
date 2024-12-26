import PropTypes from 'prop-types'

import { useAuthentication } from '../AuthenticationProvider/AuthenticationHook.jsx'
import LoadingElement from '../LoadingElement/LoadingElement.jsx'

const AuthenticatedElement = ({ children }) => {
    const { isAuthenticated, isSessionLoading } = useAuthentication()

    if (isSessionLoading) return <LoadingElement />

    return isAuthenticated ? children : null
}

export default AuthenticatedElement

AuthenticatedElement.propTypes = {
    children: PropTypes.any.isRequired
}
