class ServerState {
    constructor() {
        this.activeProjects = {};
        this.activeBreaks = {};
        this.projects = [];
        this.selectedProject = undefined;
        this.projectsDirty = true;

        this.entries = [];
        this.entriesDirty = true;

        this.todos = [];
        this.todosDirty = true;

        this.notes = {};
        this.notesDirty = true;
    }

    removeProject(project_id) {
        if (this.selectedProject == project_id) this.selectedProject = undefined;
        this.projects = this.projects.filter(project => project.id != project_id);
    }

    startActive(project_id) {
        this.activeProjects[project_id] = {
            start: Date.now(),
            end: undefined
        }
    }

    endActive(project_id, callback) {
        this.activeProjects[project_id].end = Date.now();
        let copy = this.activeProjects[project_id];
        delete this.activeProjects[project_id];

        if (callback) callback(copy);
    }

    startBreak(project_id) {
        this.activeBreaks[project_id] = {
            start: Date.now(),
            end: undefined
        }
    }

    endBreak(project_id, callback) {
        this.activeBreaks[project_id].end = Date.now();
        let copy = this.activeBreaks[project_id];
        delete this.activeBreaks[project_id];

        if (callback) callback(copy);
    }

    isActive(project_id) {
        return this.activeProjects.hasOwnProperty(project_id);
    }

    isBreakActive(project_id) {
        return this.activeBreaks.hasOwnProperty(project_id);
    }

    selectProject(project_id) {
        this.selectedProject = project_id;
    }

    noteExists(noteId) {
        return this.notes.hasOwnProperty(noteId);
    }

    updateNoteTitle(noteId, noteTitle, callback) {
        this.notes[noteId].title = noteTitle;
        if (callback) callback();
    }

    updateNoteContents(noteId, noteContents, callback) {
        this.notes[noteId].contents = noteContents;
        if (callback) callback();
    }

    updateNoteLinkedProject(noteId, noteLinkedProject, callback) {
        this.notes[noteId].linkedProject = noteLinkedProject;
        if (callback) callback();
    }

    createNote(noteId, callback) {
        this.notes[noteId] = {noteId: noteId, title: "", contents: "", linkedProject: -1};
        if (callback) callback();
    }

    deleteNote(noteId, callback) {
        delete this.notes[noteId];
        if (callback) callback();
    }
}

module.exports = new ServerState();