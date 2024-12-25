import PropTypes from 'prop-types'

import { useAuthenticationHook } from '../AuthenticationProvider/AuthenticationHook.jsx'

const AuthenticatedRoute = ({ children }) => {
    const { loggedIn } = useAuthenticationHook()

    return loggedIn ? children : null
}

export default AuthenticatedRoute

AuthenticatedRoute.propTypes = {
    children: PropTypes.any.isRequired
}
