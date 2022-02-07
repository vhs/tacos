import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Spinner } from 'react-bootstrap'

import './LoadingElement.css'

class Loading extends Component {
  render () {
    return (
      <div id='custom-loader'>
        <Spinner animation="border" role="status" />
        <span className="visually-hidden">Loading...</span>
      </div>
    )
  }
}

Loading.propTypes = {
  colour: PropTypes.string
}

export default Loading
