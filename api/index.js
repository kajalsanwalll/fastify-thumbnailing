const app = require('../server.js');

module.exports = async (req, res) => {
  await app.ready();
  app.server.emit('request', req, res);
};