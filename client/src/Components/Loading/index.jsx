import React, { Component } from 'react'

import PropTypes from 'prop-types'

class Loading extends Component {
    constructor(props) {
        super(props)

        this.state = { loading: props.loading }
    }

    componentDidUpdate(prevProps) {
        if (this.props.loading !== prevProps.loading) {
            this.setState({ loading: this.props.loading })
        }
    }

    render() {
        return <>{this.state.loading ? 'Loading...' : this.props.children}</>
    }
}

export default Loading

Loading.propTypes = {
    loading: PropTypes.bool,
    children: PropTypes.any
}

Loading.defaultProps = {
    loading: false
}
