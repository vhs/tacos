import { useEffect, useState } from 'react'

import TimeAgo from 'anderm-react-timeago'
import PropTypes from 'prop-types'
import { Button, Col, Form, FormControl, Row } from 'react-bootstrap'
import useSWR from 'swr'

import { useDevices } from '../../hooks/useDevices.jsx'
import { useTerminals } from '../../hooks/useTerminals.jsx'
import CustomLogger from '../../lib/custom-logger'
import { fetcher } from '../../lib/fetcher'
import LoadingElement from '../LoadingElement/LoadingElement.jsx'

import './style.css'

const log = new CustomLogger('tacos:Components:TerminalCard')

const TerminalCard = ({ id }) => {
    const { devices } = useDevices()
    const { mutateTerminals } = useTerminals()

    const [terminalId, setTerminalId] = useState(id)

    useEffect(() => {
        if (id !== terminalId) setTerminalId(id)
    }, [])

    const {
        data: terminal,
        isLoading,
        mutate
    } = useSWR(`/api/terminals/details/${terminalId}`, fetcher, {
        refreshInterval: 5000
    })

    const deleteTerminal = async () => {
        if (window.confirm('Are you sure?') === true) {
            const response = await fetch(
                `/api/terminals/delete/${terminalId}`,
                { method: 'POST' }
            )

            log.debug('deleteTerminal', 'response', response.data)

            mutateTerminals()
        }
    }

    const updateDescription = async (event) => {
        const description = event.target.value

        log.debug('_updateDescription', 'description', description)

        await fetch(`/api/terminals/update/description/${terminalId}`, {
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

    const updateSecret = async (event) => {
        const secret = event.target.value

        log.debug('_updateTarget', 'secret', secret)

        await fetch(`/api/terminals/update/secret/${terminalId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                secret
            })
        })

        mutate()

        return true
    }

    const updateTarget = async (event) => {
        const target = event.target.value

        log.debug('_updateTarget', 'target', target)

        await fetch(`/api/terminals/update/target/${terminalId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                target: target !== '---' ? target : null
            })
        })

        mutate()

        return true
    }

    const updateEnabled = async (event) => {
        const enabled = event.target.checked ? 1 : 0

        log.debug('_updateEnabled', 'enabled', enabled)

        const response = await fetch(
            `/api/terminals/update/enabled/${terminalId}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    enabled
                })
            }
        )

        log.debug('_updateEnabled', response)

        mutate()

        return true
    }

    log.debug('TerminalCard', { terminal })

    if (isLoading) return <LoadingElement />

    return (
        <Col xs='12' sm='12' md='6' lg='6' xl={4} className='TerminalCard'>
            <Row className='spacious'>
                <Col>
                    <Row className='tool-title'>
                        <Col>
                            <div>
                                <h3>{terminalId}</h3>
                            </div>
                        </Col>
                    </Row>
                    <Row className='spacious'>
                        <Col>
                            <b> Description:</b>
                        </Col>
                        <Col>
                            <FormControl
                                id='TerminalId'
                                className='description-control'
                                type='input'
                                onChange={updateDescription}
                                value={terminal.description}
                            />
                        </Col>
                    </Row>
                    <Row className='spacious'>
                        <Col>
                            <b>Enabled:</b>
                        </Col>
                        <Col>
                            <Form.Check
                                type='checkbox'
                                checked={terminal.enabled === 1}
                                label={
                                    terminal.enabled === 1
                                        ? 'Enabled'
                                        : 'Disabled'
                                }
                                onChange={updateEnabled}
                            />
                        </Col>
                    </Row>
                    <Row className='spacious'>
                        <Col>
                            <b>Target:</b>
                        </Col>
                        <Col>
                            <Form.Group controlId='SelectTarget'>
                                <Form.Select
                                    value={terminal.target ?? '---'}
                                    onChange={updateTarget}
                                >
                                    <option value={null}>---</option>
                                    {devices.map((device) => (
                                        <option
                                            key={device.id}
                                            value={device.id}
                                        >
                                            {device.description}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='spacious'>
                        <Col>
                            <b>Secure:</b>
                        </Col>
                        <Col>
                            <span className='securestate'>
                                {terminal.secure ? 'Secured' : 'Not secured'}
                            </span>
                        </Col>
                    </Row>
                    <Row className='spacious'>
                        <Col>
                            <b> Secret:</b>
                        </Col>
                        <Col>
                            <FormControl
                                id='TerminalSecret'
                                className='description-control'
                                type='password'
                                onChange={updateSecret}
                                value={terminal.secret}
                            />
                        </Col>
                    </Row>
                    <Row className='spacious'>
                        <Col>
                            <b>Last Seen:</b>
                        </Col>
                        <Col>
                            <TimeAgo date={terminal.last_seen} />
                        </Col>
                    </Row>
                    <Row className='spacious'>
                        <Col>
                            <Button
                                className='btn-danger'
                                onClick={deleteTerminal}
                            >
                                DELETE
                            </Button>
                        </Col>
                        <Col>&nbsp;</Col>
                        <Col className='pull-right'></Col>
                    </Row>
                </Col>
            </Row>
        </Col>
    )
}

export default TerminalCard

TerminalCard.propTypes = {
    id: PropTypes.string
}
