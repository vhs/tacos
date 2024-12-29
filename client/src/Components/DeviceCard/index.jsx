import { useEffect, useState } from 'react'

import TimeAgo from 'anderm-react-timeago'
import PropTypes from 'prop-types'
import { Button, Col, Form, FormControl, Row } from 'react-bootstrap'
import { toast } from 'react-toastify'
import useSWR from 'swr'

import { useDevices } from '../../hooks/useDevices.jsx'
import { useRoles } from '../../hooks/useRoles.jsx'
import CustomLogger from '../../lib/custom-logger'
import { fetcher } from '../../lib/fetcher.js'
import AdminElement from '../AdminElement/index.jsx'
import { useAuthentication } from '../AuthenticationProvider/AuthenticationHook.jsx'
import './style.css'
import Loading from '../Loading/index.jsx'

const log = new CustomLogger('tacos:Components:DeviceCard')

const timeoutWindow = 5000

const DeviceCard = ({ id }) => {
    const { roles, isRolesLoading } = useRoles()
    const { user, isSessionLoading } = useAuthentication()
    const { mutateDevices } = useDevices()

    const [deviceId, setDeviceId] = useState(id)

    useEffect(() => {
        if (id !== deviceId) setDeviceId(id)
    }, [id])

    const {
        data: device,
        isLoading: isDeviceLoading,
        mutate
    } = useSWR(`/api/devices/details/${deviceId}`, fetcher, {
        refreshInterval: 5000
    })

    const toggleDeviceHot = async () => {
        const arming = Boolean(device.armed) === false
        const url = `/api/devices/${arming ? 'arm' : 'unarm'}/${device.id}`

        toast.promise(fetch(url, { method: 'POST' }), {
            pending: `${arming ? 'Arming' : 'Unarming'} ${device.description}`,
            success: {
                render: () =>
                    `${arming ? 'Armed' : 'Unarmed'} ${device.description}`,
                autoClose: arming ? 20000 : 5000
            },
            error: `Failed to ${arming ? 'arm' : 'unarm'} ${device.description}`
        })

        mutate()
    }

    const deleteDevice = async () => {
        if (window.confirm('Are you sure?') === true) {
            await fetch(`/api/devices/delete/${deviceId}`, {
                method: 'POST'
            })

            mutateDevices()
        }
    }

    const updateDescription = async (event) => {
        const description = event.target.value

        log.debug('updateDescription', 'description', description)

        log.debug('updateDescription', 'device', device)

        await fetch(`/api/devices/update/description/${deviceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description
            })
        })

        mutate()

        return true
    }

    const updateRole = async (event) => {
        const role = event.target.value

        log.debug('updateRole', 'role', role)

        log.debug('updateRole', 'device', device)

        await fetch(`/api/devices/update/role/${deviceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role
            })
        })

        mutate()

        return true
    }

    if (isDeviceLoading || isRolesLoading || isSessionLoading)
        return <Loading />

    return (
        <Col xs={12} sm={12} md={6} lg={4} className='DeviceCard'>
            <Row className='spacious'>
                <Col>
                    <Row className='tool-title'>
                        <Col>
                            <div>
                                <h3>{device.id}</h3>
                            </div>
                        </Col>
                    </Row>
                    <Row className='spacious'>
                        <Col xs='12' sm='12' md='4' lg='4'>
                            <b>Description:</b>
                        </Col>
                        <Col xs='12' sm='12' md='8' lg='8'>
                            {device.description}
                        </Col>
                    </Row>
                    <AdminElement user={user}>
                        <Row className='spacious'>
                            <Col xs='12' sm='12' md='4' lg='4'>
                                <b> Description:</b>
                            </Col>
                            <Col>
                                <FormControl
                                    id='DeviceId'
                                    className='description-control'
                                    type='input'
                                    onChange={updateDescription}
                                    value={device.description}
                                />
                            </Col>
                        </Row>
                        <Row className='spacious'>
                            <Col xs='12' sm='12' md='4' lg='4'>
                                <b>Role:</b>
                            </Col>
                            <Col>
                                <Form.Group controlId='SelectRole'>
                                    <Form.Control
                                        as='select'
                                        custom
                                        value={device.role}
                                        onChange={updateRole}
                                    >
                                        {roles.map((role) => (
                                            <option
                                                key={role.code}
                                                value={role.code}
                                            >
                                                {role.code}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                    </AdminElement>
                    <Row className='spacious'>
                        <Col xs='12' sm='12' md='4' lg='4'>
                            <b>State:</b>
                        </Col>
                        <Col>
                            <span className='powerstate pull-right'>
                                {device.armed ? 'Armed' : 'Unarmed'}
                            </span>
                        </Col>
                    </Row>
                    <Row className='spacious'>
                        <Col xs='12' sm='12' md='4' lg='4'>
                            <b>Last Seen:</b>
                        </Col>
                        <Col>
                            <span className='pull-right'>
                                <TimeAgo date={device.last_seen} />
                            </span>
                        </Col>
                    </Row>
                    <Row className='spacious'>
                        <Col>
                            <AdminElement user={user}>
                                <Button
                                    className='btn-danger'
                                    onClick={deleteDevice}
                                >
                                    DELETE
                                </Button>
                            </AdminElement>
                        </Col>
                        <Col></Col>
                        <Col className='pull-right'>
                            <Button
                                className='pull-right powerbutton'
                                onClick={toggleDeviceHot}
                            >
                                {Boolean(device.armed) === false
                                    ? 'ARM'
                                    : 'DISARM'}
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Col>
    )
}

export default DeviceCard

DeviceCard.propTypes = {
    id: PropTypes.string
}
