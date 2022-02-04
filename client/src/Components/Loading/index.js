import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Loading extends Component {
  render () {
    return (
      <>
        {this.props.loading ? 'Loading...' : this.props.children}
      </>
    )
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
