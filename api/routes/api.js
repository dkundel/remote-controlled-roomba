var express = require('express');
var router = express.Router();
const { addCommand } = require('../utils/scheduling');

/* GET users listing. */
router.get('/', async function (req, res, next) {
  if ('command' in req.query) {
    // console.log(req.query.command);
    await addCommand(req.query.command);
    res.send('Sending command ' + req.query.command);
  } else {
    res.send('Cannot find that command');
  }
});

module.exports = router;
