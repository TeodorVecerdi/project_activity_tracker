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
            if(serverState.selectedProject == projectId) serverState.entriesDirty = true;
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
            if(serverState.selectedProject == projectId) serverState.entriesDirty = true;
            database.addEntry(projectId, 1, copy, () => {
                res.status(200).end();
            });
        });
    else {
        serverState.startBreak(projectId);
        res.status(200).end();
    }
});

router.post('/select-project', (req, res) => {
    let projectId = req.body.id;
    serverState.selectProject(projectId);
    serverState.entriesDirty = true;
    res.status(200).end();
});

router.get('/get-entries', (req, res) => {
    let selectedProject = serverState.selectedProject;
    if(selectedProject === undefined) res.status(404).end();

    if (serverState.entriesDirty) {
        database.getEntries(selectedProject, entries => {
            serverState.entries = [...entries];
            serverState.entriesDirty = false;
            res.status(200).send({entries: entries});
        });
    } else {
        res.status(200).send({entries: serverState.entries});
    }
})

router.post('/update-entry-comment', (req, res) => {
    let entryId = req.body.id;
    let commentText = req.body.comment;

    database.updateEntryComment(entryId, commentText, () => {
        let changedIndex = serverState.entries.findIndex(entry => entry.id == entryId);
        if(changedIndex === -1) serverState.entriesDirty = true;
        else serverState.entries[changedIndex].comment = commentText;
        res.status(200).end();
    });
})

module.exports = {url: "/project", router: router};
