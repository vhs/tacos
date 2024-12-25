import PropTypes from 'prop-types'

const Conditional = ({ children, condition }) => {
    if (condition === false) {
        return null
    }

    return <>{children}</>
}

export default Conditional

Conditional.propTypes = {
    children: PropTypes.any,
    condition: PropTypes.bool.isRequired
}
