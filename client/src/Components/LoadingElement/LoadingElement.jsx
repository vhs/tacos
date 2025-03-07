import { Spinner } from 'react-bootstrap'

import './LoadingElement.css'

const LoadingElement = () => {
    return (
        <div id='custom-loader'>
            {/* eslint-disable-next-line jsx-a11y/aria-role */}
            <Spinner animation='border' role='output' />
            <span className='visually-hidden'>Loading...</span>
        </div>
    )
}

export default LoadingElement
