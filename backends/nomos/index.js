'use strict'

const path = require('path')

var _ = require('underscore')
var debug = require('debug')('atoms:backend:nomos')
var axios = require('axios')

var config = require(path.join(__dirname, '../../lib/config'))
var { getLine } = require(path.join(__dirname, '../../lib/utils'))

debug(getLine(), 'Loading nomos backend')

var rolesCache = []
var rolesLastLoaded = Date.now()
var fetchingRoles = false

var loadRoles = function () {
  if (fetchingRoles) return

  fetchingRoles = true
  debug(getLine(), 'loading roles', rolesLastLoaded)

  var params = {
    'page': 0,
    'size': 25,
    'columns': 'id,name,code,description,enabled',
    'order': 'name',
    'filters': {
      'column': 'code',
      'operator': 'like',
      'value': 'tool:%'
    }
  }

  var options = {
    method: 'POST',
    url: config[config.backend].userRolesUrl,
    headers: {
      'X-Api-Key': config[config.backend].credentials.key
    },
    json: true,
    data: params
  }

  return axios(options)
    .then((rolesResult) => {
      let rolesData = rolesResult.data
      debug(getLine(), 'got data:', rolesData.status, rolesData.statusText)
      debug(getLine(), 'data:', rolesData.data)


      if (typeof rolesData === 'object' && rolesData.length > 0) {
        rolesCache = rolesData
      }

      debug(getLine(), 'Roles:', rolesCache)

      rolesLastLoaded = Date.now()

      return rolesCache
    }).catch((err) => {
      debug(getLine(), 'error caught:')
      debug(getLine(), err)
      return { 'valid': false, error: true }
    }).finally(() => { fetchingRoles = false })
}

loadRoles()

var getRoles = function () {
  if (((rolesLastLoaded + config[config.backend].caching.timeout) < Date.now()))
    loadRoles()

  return rolesCache
}

var checkUser = async function (user) {
  debug(getLine(), 'checkUser', user)
  var service = user.provider
  var id = user.id

  debug(getLine(), 'checkUser', 'Service Name: ' + service)
  debug(getLine(), 'checkUser', 'Service ID: ' + id)

  var params = {}
  params.service = service
  params.id = id

  var options = {
    method: 'POST',
    url: config[config.backend].userAuthUrl,
    headers: {
      'X-Api-Key': config[config.backend].credentials.key
    },
    json: true,
    data: params
  }

  var authenticated = false

  try {
    let userResult = await axios(options)

    let userData = userResult.data

    debug(getLine(), 'checkUser', 'userData', JSON.stringify(userData))

    if (userResult && userData && userData.valid === true && userData.privileges) {
      // Save username
      user.username = userData.username

      // Set defaults
      user.administrator = false
      user.privileges = []

      // Get default privileges
      user.privileges = userResult.data.privileges.reduce((privileges, privilege) => { privileges.push(privilege.code); return privileges }, [])

      // If the user has the administrator_role, set administrator
      if (user.privileges.indexOf(config.administrator_role) >= 0) {
        user.administrator = true
      }

      // Else if user is Nomos administrator override administrator
      if (user.privileges.indexOf('administrator') >= 0) {
        user.administrator = true
      }

      // Set as authenticated
      authenticated = true
    }

    return authenticated
  } catch (err) {
    debug(getLine(), 'checkUser', 'caught error')
    // Log this for now and proceed to the next promise
    console.error(err)
    user.valid = false
    return authenticated
  }
}

var checkCard = function (cardRequest) {
  debug(getLine(), 'checkCard')
  debug(getLine(), 'checkCard', 'cardRequest', cardRequest)

  var params = {}
  params.rfid = cardRequest.id

  var options = {
    method: 'POST',
    url: config[config.backend].cardAuthUrl,
    headers: {
      'X-Api-Key': config[config.backend].credentials.key,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: params
  }

  debug(getLine(), 'checkCard', 'options', options)

  return axios(options).then((requestResult) => {
    let cardResult = requestResult.data

    debug(getLine(), 'got CheckRFID result:', cardResult.valid)
    var valid = false

    if (cardResult && cardResult.valid) {
      // Save valid
      valid = cardRequest.valid = cardResult.valid

      // Set defaults
      cardRequest.privileges = []
      cardRequest.administrator = false

      if (valid) {
        // Save username
        cardRequest.username = cardResult.username

        // Get default privileges
        _.each(cardResult.privileges, (priv) => {
          cardRequest.privileges.push(priv.code)
        })

        // If the user has the administrator_role, set administrator
        if (cardRequest.privileges.indexOf(config.administrator_role) >= 0) {
          debug(getLine(), 'User', cardRequest.username, 'has administrator_role')
          cardRequest.administrator = true
        }

        // Else if user is Nomos administrator override administrator
        if (cardRequest.privileges.indexOf('administrator') >= 0) {
          debug(getLine(), 'User', cardRequest.username, 'is administrator')
          cardRequest.administrator = true
        }
      }
    }

    return valid
  })
    .catch((err) => {
      debug(getLine(), 'caught error')
      // Log this for now and proceed to the next promise
      debug(getLine(), err)
      return { 'valid': false, error: true }
    })
}

module.exports = { getRoles, checkUser, checkCard }
