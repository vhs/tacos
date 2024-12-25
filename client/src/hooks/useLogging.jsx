import useSWR from 'swr'

import { fetcher } from '../lib/fetcher'

export const useLogging = () => {
    const { data, isLoading } = useSWR('/api/logging', fetcher, {
        refreshInterval: 5000
    })

    return {
        logs: data?.data,
        hasLogs: data?.data?.length > 0 && !isLoading,
        isLoggingLoading: isLoading
    }
}
