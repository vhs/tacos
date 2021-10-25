import React, { Component } from 'react'
import PropTypes from 'prop-types'

class AuthenticatedElement extends Component {
  render () {
    return (
            <>
                {this.props.loggedIn ? this.props.children : null}
            </>
    )
  }
}

export default AuthenticatedElement

AuthenticatedElement.propTypes = {
  loggedIn: PropTypes.bool,
  children: PropTypes.any.isRequired
}

AuthenticatedElement.defaultProps = {
  loggedIn: false
}
