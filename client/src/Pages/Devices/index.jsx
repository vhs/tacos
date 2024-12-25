import { Col, Row } from 'react-bootstrap'

import { useAuthenticationHook } from '../../Components/AuthenticationProvider/AuthenticationHook.jsx'
import DeviceCard from '../../Components/DeviceCard/index.jsx'
import Loading from '../../Components/Loading/index.jsx'
import { useDevices } from '../../hooks/useDevices.jsx'
import { useRoles } from '../../hooks/useRoles.jsx'
import CustomLogger from '../../lib/custom-logger/index.js'

const log = new CustomLogger('tacos:Pages:Devices')

const Devices = () => {
    const { devices, hasDevices, isDevicesLoading } = useDevices()
    const { isRolesLoading } = useRoles()

    const { user } = useAuthenticationHook()

    const loading = user == null || isDevicesLoading || isRolesLoading

    return (
        <Loading loading={loading}>
            <Row>
                <Col>
                    <h1>Devices</h1>
                </Col>
            </Row>
            <Row>
                {hasDevices ? (
                    devices.map((device) => {
                        return <DeviceCard key={device.id} id={device.id} />
                    })
                ) : (
                    <span>
                        Sorry! We can&apos;t find any devices at this time!
                    </span>
                )}
            </Row>
        </Loading>
    )
}

export default Devices
