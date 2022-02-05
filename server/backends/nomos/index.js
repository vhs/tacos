'use strict'

const debug = require('debug')('tacos:backend:nomos')
const axios = require('axios')

const { config } = require('../../lib/config')
const { getLine } = require('../../lib/utils')

debug(getLine(), 'Loading nomos backend')

let rolesCache = []
let rolesLastLoaded = Date.now()
let fetchingRoles = false

const loadRoles = function () {
  if (fetchingRoles) return

  fetchingRoles = true
  debug(getLine(), 'loading roles', rolesLastLoaded)

  const params = {
    page: 0,
    size: 25,
    columns: 'id,name,code,description,enabled',
    order: 'name',
    filters: {
      column: 'code',
      operator: 'like',
      value: 'tool:%'
    }
  }

  const options = {
    method: 'POST',
    url: config[config.backend].userRolesUrl,
    headers: {
      'X-Api-Key': config[config.backend].credentials.key
    },
    json: true,
    data: params
  }

  // @ts-ignore
  return axios(options)
    .then((rolesResult) => {
      const rolesData = rolesResult.data
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
      return { valid: false, error: true }
    }).finally(() => { fetchingRoles = false })
}

loadRoles()

const getRoles = function () {
  if (((rolesLastLoaded + config[config.backend].caching.timeout) < Date.now())) { loadRoles() }

  return rolesCache
}

const checkUser = async function (user) {
  debug(getLine(), 'checkUser', user)
  const service = user.provider
  const id = user.id

  debug(getLine(), 'checkUser', 'Service Name: ' + service)
  debug(getLine(), 'checkUser', 'Service ID: ' + id)

  const params = {}
  params.service = service
  params.id = id

  const options = {
    method: 'POST',
    url: config[config.backend].userAuthUrl,
    headers: {
      'X-Api-Key': config[config.backend].credentials.key
    },
    json: true,
    data: params
  }

  let authenticated = false

  try {
    // @ts-ignore
    const userResult = await axios(options)

    const userData = userResult.data

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
      // if (user.privileges.indexOf('administrator') >= 0) {
      //   user.administrator = true
      // }

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

const checkCard = function (cardRequest) {
  debug(getLine(), 'checkCard')
  debug(getLine(), 'checkCard', 'cardRequest', cardRequest)

  const params = {}
  params.rfid = cardRequest.id

  const options = {
    method: 'POST',
    url: config[config.backend].cardAuthUrl,
    headers: {
      'X-Api-Key': config[config.backend].credentials.key,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: params
  }

  debug(getLine(), 'checkCard', 'options', options)

  // @ts-ignore
  return axios(options).then((requestResult) => {
    const cardResult = requestResult.data

    debug(getLine(), 'got CheckRFID result:', cardResult.valid)
    let valid = false

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
        for (const privIdx in cardResult.privileges) {
          cardRequest.privileges.push(cardResult.privileges[privIdx].code)
        }

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
      return { valid: false, error: true }
    })
}

module.exports = { getRoles, checkUser, checkCard }
