import { useContext } from 'react'

import { AuthenticationContext } from './AuthenticationContext.jsx'

export const useAuthentication = () => {
    const authenticationContext = useContext(AuthenticationContext)

    if (authenticationContext == null)
        throw new Error(
            'Missing AuthenticationContext. Only use this hook with the AuthenticationProvider.'
        )

    return authenticationContext
}
