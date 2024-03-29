import React, { Component } from 'react'
import PropTypes from 'prop-types'

import CustomLogger from 'lib/custom-logger'

const log = new CustomLogger('tacos:Components:AdminElement')

class AdminElement extends Component {
  constructor (props) {
    super(props)
    log.debug('props', props)
  }

  render () {
    const isAdmin = (this.props.user.administrator !== undefined && this.props.user.administrator === true)

    log.debug('render', 'isAdmin', isAdmin)
    log.debug('render', 'this.props.user.administrator', this.props.user.administrator)

    return (
      <>
        {isAdmin ? this.props.children : null}
      </>
    )
  }
}

export default AdminElement

AdminElement.propTypes = {
  user: PropTypes.object,
  children: PropTypes.any
}
