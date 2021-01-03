let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('pages/index', {"activeTab": "home"});
});

module.exports = {url: "/", router: router};
