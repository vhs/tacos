import PropTypes from 'prop-types'
import { Navigate } from 'react-router'

import { useAuthentication } from '../AuthenticationProvider/AuthenticationHook.jsx'

const AuthenticatedRoute = ({ children, fallback }) => {
    const { isAuthenticated, isSessionLoading } = useAuthentication()

    if (isSessionLoading) return null

    if (!isAuthenticated) return <Navigate to={fallback ?? '/login'} />

    return children
}

export default AuthenticatedRoute

AuthenticatedRoute.propTypes = {
    children: PropTypes.any.isRequired,
    fallback: PropTypes.any.isRequired
}
