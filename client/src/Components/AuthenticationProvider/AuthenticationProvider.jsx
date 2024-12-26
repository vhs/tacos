import { useMemo } from 'react'

import PropTypes from 'prop-types'
import useSWR from 'swr'

import { fetcher } from '../../lib/fetcher.js'

import { AuthenticationContext } from './AuthenticationContext.jsx'

export const AuthenticationProvider = ({ children }) => {
    const { data, isLoading, mutate } = useSWR(`/api/session`, fetcher, {
        refreshInterval: 15000
    })

    const providerValue = useMemo(() => {
        return {
            user: data?.user,
            isAuthenticated: data?.user?.authenticated ?? false,
            isAdministrator: data?.user?.administrator ?? false,
            isSessionLoading: isLoading,
            mutateSession: mutate
        }
    }, [data, isLoading])

    return (
        <AuthenticationContext.Provider value={providerValue}>
            {children}
        </AuthenticationContext.Provider>
    )
}

AuthenticationProvider.propTypes = {
    children: PropTypes.object
}
