import PropTypes from 'prop-types'

import LoadingElement from '../LoadingElement/LoadingElement.jsx'

const Loading = ({ children, loading }) => {
    loading ??= false

    return loading ? <LoadingElement /> : children
}

export default Loading

Loading.propTypes = {
    loading: PropTypes.bool,
    children: PropTypes.any
}
