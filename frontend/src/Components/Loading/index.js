import React, { Component } from 'react'

class Loading extends Component {
    render() {
        return (
            <>
                {this.props.loading ? "Loading..." : this.props.children}
            </>
        )
    }
}

export default Loading