let express = require('express');
let router = express.Router();
let database = require('../js/Database');
let serverState = require('../js/ServerState');

router.get('/get', (req, res, next) => {
    if (serverState.projectsDirty) {
        database.getProjects(projects => {
            serverState.projects = [... projects];
            serverState.projectsDirty = false;
            res.status(200).send({
                projects: serverState.projects,
                activeProjects: serverState.activeProjects,
                activeBreaks: serverState.activeBreaks,
                selectedProject: serverState.selectedProject
            });
        });
    } else {
        res.status(200).send({
            projects: serverState.projects,
            activeProjects: serverState.activeProjects,
            activeBreaks: serverState.activeBreaks,
            selectedProject: serverState.selectedProject
        });
    }
})

router.post('/create', (req, res) => {
    database.addProject(req.body.projectName);
    serverState.projectsDirty = true;
    res.status(201).end();
})

router.delete('/remove', (req, res) => {
    let removedIndex = serverState.projects.findIndex(project => project.id == req.body.id);
    if(removedIndex === -1) {
        serverState.projectsDirty = true;
        res.status(404).end();
    }

    serverState.removeProject(req.body.id);
    database.removeProject(req.body.id, () => {
        serverState.notesDirty = true;
        serverState.todosDirty = true;
        res.status(200).end();
    });
})

router.patch('/change-active', (req, res) => {
    let projectId = req.body.id;
    let changedIndex = serverState.projects.findIndex(project => project.id == projectId);
    if(changedIndex === -1) {
        serverState.projectsDirty = true;
        res.status(404).end();
        return;
    }

    let isActive = serverState.isActive(projectId);
    if (isActive)
        serverState.endActive(projectId, activeProject => {
            if (serverState.selectedProject == projectId) serverState.entriesDirty = true;
            database.addEntry(projectId, 0, activeProject, () => {
                // Also end break is break was active.
                if (serverState.isBreakActive(projectId)) {
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

router.patch('/change-break', (req, res) => {
    let projectId = req.body.id;
    let changedIndex = serverState.projects.findIndex(project => project.id == projectId);
    if(changedIndex === -1) {
        serverState.projectsDirty = true;
        res.status(404).end();
        return;
    }

    let isBreakActive = serverState.isBreakActive(projectId);
    if (isBreakActive)
        serverState.endBreak(projectId, copy => {
            if (serverState.selectedProject == projectId) serverState.entriesDirty = true;
            database.addEntry(projectId, 1, copy, () => {
                res.status(200).end();
            });
        });
    else {
        serverState.startBreak(projectId);
        res.status(200).end();
    }
});

router.put('/select-project', (req, res) => {
    let projectId = req.body.id;
    let selectedIndex = serverState.projects.findIndex(project => project.id == projectId);
    if(selectedIndex === -1) {
        serverState.projectsDirty = true;
        res.status(404).end();
        return;
    }

    serverState.selectProject(projectId);
    serverState.todosDirty = true;
    serverState.entriesDirty = true;
    res.status(200).end();
});

router.patch('/change-hidden', (req, res, next) => {
    let projectId = req.body.id;
    let selectedIndex = serverState.projects.findIndex(project => project.id == projectId);
    if(selectedIndex === -1) {
        serverState.projectsDirty = true;
        res.status(404).end();
        return;
    }

    let isHidden = serverState.projects[selectedIndex].hidden;
    serverState.projects[selectedIndex].hidden = !isHidden;
    if(serverState.selectedProject == projectId) serverState.selectedProject = -1;
    res.status(200).end();

    database.setProjectHidden(projectId, isHidden ? 0 : 1);
});

router.get('/get-entries', (req, res) => {
    let selectedProject = serverState.selectedProject;
    if (selectedProject === undefined) res.status(404).end();

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

router.patch('/update-entry-comment', (req, res) => {
    let entryId = req.body.id;
    let commentText = req.body.comment;

    database.updateEntryComment(entryId, commentText, () => {
        let changedIndex = serverState.entries.findIndex(entry => entry.id == entryId);
        if (changedIndex === -1) serverState.entriesDirty = true;
        else serverState.entries[changedIndex].comment = commentText;
        res.status(200).end();
    });
})

module.exports = {url: "/project", router: router};
