import { Col, Row } from 'react-bootstrap'

import Conditional from '../../Components/Conditional/Conditional.jsx'
import LoadingElement from '../../Components/LoadingElement/LoadingElement.jsx'
import TerminalCard from '../../Components/TerminalCard/index.jsx'
import { useDevices } from '../../hooks/useDevices.jsx'
import { useTerminals } from '../../hooks/useTerminals.jsx'
import CustomLogger from '../../lib/custom-logger'

const log = new CustomLogger('tacos:Pages:Terminals')

const Terminals = (props) => {
    log.debug('constructor')

    const { isDevicesLoading } = useDevices()
    const { terminals, hasTerminals, isTerminalsLoading } = useTerminals()

    const loading = isDevicesLoading || isTerminalsLoading

    return (
        <>
            <Row>
                <Col>
                    <h1>Terminals</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Conditional condition={loading === true}>
                        <LoadingElement />
                    </Conditional>
                    <Conditional condition={loading === false}>
                        {hasTerminals ? (
                            terminals.map((terminal) => (
                                <TerminalCard
                                    key={terminal.id}
                                    id={terminal.id}
                                />
                            ))
                        ) : (
                            <span>
                                Sorry! We can&apos;t find any terminals at this
                                time!
                            </span>
                        )}
                    </Conditional>
                </Col>
            </Row>
        </>
    )
}

export default Terminals
