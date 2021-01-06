let express = require('express');
let router = express.Router();

let {v4} = require('uuid');

let database = require('../js/Database');
let serverState = require('../js/ServerState');

router.get('/', (req, res, next) => {
    res.render('pages/notes', {"activeTab": "notes"});

});

router.get('/edit', (req, res, next) => {
    let newId = v4();
    serverState.createNote(newId);
    res.status(201).redirect(`/notes/edit/${newId}`);

    database.createNote(newId);
});

router.get('/edit/:noteId', async (req, res, next) => {
    let noteId = req.params.noteId;
    let foundId = await noteIdValidator(noteId, res);

    if (!foundId) {
        res.end();
        return;
    }
    res.render('pages/notes-edit', {"activeTab": "notes", "noteId": noteId});
});

router.get('/view/:noteId', async (req, res, next) => {
    let noteId = req.params.noteId;
        console.log("START> ID")
    let foundId = await noteIdValidator(noteId, res);
        console.log("DONE> ID")

    if (!foundId) {
        console.log("Could not find ID")
        res.end();
        return;
    }

    res.render('pages/notes-view', {"activeTab": "notes", "noteId": noteId});
});

router.get('/get', (req, res, next) => {
    if (serverState.notesDirty) {
        database.getNotes(notes => {
            serverState.notes = notes;
            serverState.notesDirty = false;
            res.status(200).send({
                notes: serverState.notes
            });
        });
    } else {
        res.status(200).send({
            notes: serverState.notes
        });
    }
});
router.get('/get/:noteId', async (req, res, next) => {
    let noteId = req.params.noteId;
    let foundId = await noteIdValidator(noteId, res);

    if (!foundId) {
        res.end();
        return;
    }

    if (serverState.notesDirty) {
        database.getNotes(notes => {
            serverState.notes = notes;
            serverState.notesDirty = false;
            res.status(200).send({
                note: serverState.notes[noteId]
            });
        });
    } else {
        res.status(200).send({
            note: serverState.notes[noteId]
        });
    }
});

router.patch('/update/contents', async (req, res, next) => {
    let noteId = req.body.noteId;
    let foundId = await noteIdValidator(noteId, res);

    if (!foundId) {
        res.end();
        return;
    }

    let noteContents = req.body.contents;
    if (noteContents === undefined) {
        res.status(400).render('pages/error', {
            message_main: `Note contents not specified (400 - Bad Request)`,
            message_redirect: `Click <a href=\"/notes\">here</a> to go back to notes`,
            message_page: "(You tried to update the contents of a note without specifying the contents :()",
            activeTab: "error"
        }).end();
        return;
    }

    if (serverState.noteExists(noteId)) {
        serverState.updateNoteContents(noteId, noteContents);
        res.status(200).end();
    } else serverState.notesDirty = true;

    database.updateNoteContents(noteId, noteContents, () => {
        res.status(200).end();
    });
});

router.patch('/update/title', async (req, res, next) => {
    let noteId = req.body.noteId;
    let foundId = await noteIdValidator(noteId, res);

    if (!foundId) {
        res.end();
        return;
    }

    let noteTitle = req.body.title;
    if (noteTitle === undefined) {
        res.status(400).render('pages/error', {
            message_main: `Note title not specified (400 - Bad Request)`,
            message_redirect: `Click <a href=\"/notes\">here</a> to go back to notes`,
            message_page: "(You tried to update the title of a note without specifying the title :()",
            activeTab: "error"
        }).end();
        return;
    }

    if (serverState.noteExists(noteId)) {
        serverState.updateNoteTitle(noteId, noteTitle);
        res.status(200).end();
    } else serverState.notesDirty = true;

    database.updateNoteTitle(noteId, noteTitle, () => {
        res.status(200).end();
    });
});

router.patch('/update/linked-project', async (req, res, next) => {
    let noteId = req.body.noteId;
    let foundId = await noteIdValidator(noteId, res);

    if (!foundId) {
        res.end();
        return;
    }

    let noteLinkedProject = req.body.linkedProject;
    if (noteLinkedProject === undefined) {
        res.status(400).render('pages/error', {
            message_main: `Note linked project not specified (400 - Bad Request)`,
            message_redirect: `Click <a href=\"/notes\">here</a> to go back to notes`,
            message_page: "(You tried to update the linked project of a note without specifying the linked project ID :()",
            activeTab: "error"
        }).end();
        return;
    }

    if (serverState.noteExists(noteId)) {
        serverState.updateNoteLinkedProject(noteId, noteLinkedProject);
        res.status(200).end();
    } else serverState.notesDirty = true;

    database.updateNoteLinkedProject(noteId, noteLinkedProject, () => {
        res.status(200).end();
    });
});

router.delete('/remove', async (req, res, next) => {
    let noteId = req.body.noteId;
    let foundId = await noteIdValidator(noteId, res);

    if (!foundId) {
        res.end();
        return;
    }

    if (serverState.noteExists(noteId)) {
        serverState.deleteNote(noteId);
        res.status(200).end();
    } else {
        serverState.notesDirty = true;
    }

    database.removeNote(noteId, () => {
        res.status(200).end();
    });
});

async function noteIdValidator(noteId, res, callback) {
    if (noteId === undefined) {
        res.status(400).render('pages/error', {
            message_main: `Note ID not specified (400 - Bad Request)`,
            message_redirect: `Click <a href=\"/notes\">here</a> to go back to notes`,
            message_page: "",
            activeTab: "error"
        });
        if (callback) callback(false);
        return false;
    }
    if (!serverState.noteExists(noteId)) {
        let existsInDatabase = await database.noteExists(noteId);
        if (!existsInDatabase) {
            res.status(404).render('pages/error', {
                message_main: `Cannot find a note with specified ID (404 - Not Found)`,
                message_redirect: `Click <a href=\"/notes\">here</a> to go back to notes`,
                message_page: `Requested note ID: ${noteId}`,
                activeTab: "error"
            });
            if (callback) callback(false)
            return false;
        } else {
            serverState.notesDirty = true;
            if (callback) callback(true);
            return true;
        }
    }
    if (callback) callback(true);
    return true;
}


module.exports = {url: "/notes", router: router};
