const getSession = function (req, res, next) {
  res.send({ account: req.account, user: req.user })
}

const dumpSession = function (req, res, next) {
  res.send({ account: req.account, user: req.user, locals: res.locals, session: req.session })
}

module.exports = { getSession, dumpSession }
