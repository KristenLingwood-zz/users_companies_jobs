const jsonwebtoken = require('jsonwebtoken');

function ensureLoggedIn(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decodedToken = jsonwebtoken.verify(token, 'key123');
    return next();
  } catch (err) {
    return res.json({
      message: 'Unauthorized'
    });
  }
}

function ensureCorrectUser(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decodedToken = jsonwebtoken.verify(token, 'key123');
    if (decodedToken.user_id === +req.params.id) {
      return next();
    } else {
      return res.json({
        message: 'Unauthorized'
      });
    }
  } catch (err) {
    return res.json({
      message: 'Unauthorized'
    });
  }
}

function ensureCorrectCompany(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decodedToken = jsonwebtoken.verify(token, 'key123');
    console.log(decodedToken.company_id, req.params.id);
    if (decodedToken.company_id === +req.params.id) {
      return next();
    } else {
      return res.json({
        message: 'Unauthorized'
      });
    }
  } catch (err) {
    return res.json({
      message: 'Unauthorized'
    });
  }
}

module.exports = {
  ensureLoggedIn,
  ensureCorrectUser,
  ensureCorrectCompany
};
