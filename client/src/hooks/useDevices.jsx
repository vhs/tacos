import useSWR from 'swr'

export const useDevices = () => {
    const { data, isLoading, mutate } = useSWR('/api/devices')

    return {
        devices: data,
        hasDevices: data?.length > 0 && !isLoading,
        isDevicesLoading: isLoading,
        mutateDevices: mutate
    }
}
