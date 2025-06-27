function basicAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="401"');
    return res.status(401).send('Authentication required.');
  }
  const base64 = auth.split(' ')[1];
  const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');
  // Troque 'admin' e '1234' pelos valores desejados
  if (user === 'admin' && pass === '1234') {
    return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="401"');
  return res.status(401).send('Authentication failed.');
}

module.exports = basicAuth;