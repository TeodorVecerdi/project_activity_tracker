let express = require('express');
let router = express.Router();
let database = require('../js/Database');
let serverState = require('../js/ServerState');

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('pages/index', {});
});

router.get('/get-projects', (req, res, next) => {
    if (serverState.projectsDirty) {
        database.getProjects(projects => {
            serverState.projects = projects;
            serverState.projectsDirty = false;
            res.status(200).send({projects: serverState.projects, activeProjects: serverState.activeProjects, activeBreaks: serverState.activeBreaks});
        });
    } else {
        res.status(200).send({projects: serverState.projects, activeProjects: serverState.activeProjects, activeBreaks: serverState.activeBreaks});
    }

})

router.post('/add-project', (req, res, next) => {
    database.addProject(req.body.projectName);
    serverState.projectsDirty = true;
    res.status(200).end();
})

router.post('/remove-project', (req, res, next) => {
    serverState.removeProject(req.body.id);
    database.removeProject(req.body.id, () => {
        res.status(200).end();
    });
})

module.exports = {url: "/", router: router};
