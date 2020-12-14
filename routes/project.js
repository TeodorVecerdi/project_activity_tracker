let express = require('express');
let router = express.Router();
let database = require('../js/Database');
let serverState = require('../js/ServerState');

router.get('/get', (req, res, next) => {
    if (serverState.projectsDirty) {
        database.getProjects(projects => {
            serverState.projects = projects;
            serverState.projectsDirty = false;
            res.status(200).send({projects: serverState.projects, activeProjects: serverState.activeProjects, activeBreaks: serverState.activeBreaks, selectedProject: serverState.selectedProject});
        });
    } else {
        res.status(200).send({projects: serverState.projects, activeProjects: serverState.activeProjects, activeBreaks: serverState.activeBreaks, selectedProject: serverState.selectedProject});
    }
})

router.post('/create', (req, res) => {
    database.addProject(req.body.projectName);
    serverState.projectsDirty = true;
    res.status(200).end();
})

router.post('/remove', (req, res) => {
    serverState.removeProject(req.body.id);
    database.removeProject(req.body.id, () => {
        res.status(200).end();
    });
})

router.post('/change-active', (req, res) => {
    let projectId = req.body.id;
    let isActive = serverState.isActive(projectId);
    if(isActive)
        serverState.endActive(projectId, activeProject => {
            database.addEntry(projectId, 0, activeProject, () => {
                // Also end break is break was active.
                if(serverState.isBreakActive(projectId)) {
                    serverState.endBreak(projectId, activeBreak => {
                        activeBreak.end = activeProject.end;
                        database.addEntry(projectId, 1, activeBreak, () => {
                            res.status(200).end();
                        });
                    });
                } else {
                    res.status(200).end();
                }
            });
        });
    else {
        serverState.startActive(projectId);
        res.status(200).end();
    }
});

router.post('/change-break', (req, res) => {
    let projectId = req.body.id;
    let isBreakActive = serverState.isBreakActive(projectId);
    if(isBreakActive)
        serverState.endBreak(projectId, copy => {
            database.addEntry(projectId, 1, copy, () => {
                res.status(200).end();
            });
        });
    else {
        serverState.startBreak(projectId);
        res.status(200).end();
    }
});

module.exports = {url: "/project", router: router};
