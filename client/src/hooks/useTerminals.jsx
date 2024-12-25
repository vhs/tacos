import useSWR from 'swr'

export const useTerminals = () => {
    const { data, isLoading, mutate } = useSWR('/api/terminals')

    return {
        terminals: data,
        hasTerminals: data?.length > 0 && !isLoading,
        isTerminalsLoading: isLoading,
        mutateTerminals: mutate
    }
}
