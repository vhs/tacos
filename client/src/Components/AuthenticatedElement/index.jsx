import PropTypes from 'prop-types'

import { useAuthentication } from '../AuthenticationProvider/AuthenticationHook.jsx'

const AuthenticatedElement = ({ children }) => {
    const { isAuthenticated } = useAuthentication()

    return <>{isAuthenticated ? children : null}</>
}

export default AuthenticatedElement

AuthenticatedElement.propTypes = {
    children: PropTypes.any.isRequired
}
