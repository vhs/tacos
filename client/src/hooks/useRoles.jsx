import useSWR from 'swr'

export const useRoles = () => {
    const { data, isLoading } = useSWR('/api/roles')

    return {
        hasRoles: data?.roles?.length > 0 && !isLoading,
        isRolesLoading: isLoading,
        roles: data?.roles
    }
}
