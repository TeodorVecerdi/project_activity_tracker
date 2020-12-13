let express = require('express');
let router = express.Router();
let database = require('../js/Database');

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('pages/index', {});
});

router.get('/get-projects', (req, res, next) => {
    database.getProjects(projects => {
        res.status(200).send(projects);
    });
})

router.post('/add-project', (req, res, next) => {
    database.addProject(req.body.projectName);
    res.status(200).end();
})

router.post('/remove-project', (req, res, next) => {
    database.removeProject(req.body.id, () => {
        res.status(200).end();
    });
})

module.exports = {url: "/", router: router};
