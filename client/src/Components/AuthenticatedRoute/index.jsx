import PropTypes from 'prop-types'

import { useAuthentication } from '../AuthenticationProvider/AuthenticationHook.jsx'

const AuthenticatedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthentication()

    return isAuthenticated ? children : null
}

export default AuthenticatedRoute

AuthenticatedRoute.propTypes = {
    children: PropTypes.any.isRequired
}
