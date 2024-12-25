import PropTypes from 'prop-types'

import { useAuthenticationHook } from '../AuthenticationProvider/AuthenticationHook.jsx'

const AuthenticatedElement = ({ children }) => {
    const { isAuthenticated } = useAuthenticationHook()

    return <>{isAuthenticated ? children : null}</>
}

export default AuthenticatedElement

AuthenticatedElement.propTypes = {
    children: PropTypes.any.isRequired
}
