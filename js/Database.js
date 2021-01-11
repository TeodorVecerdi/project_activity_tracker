let mysql = require("mysql");

class Database {
    constructor() {
        this.con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "project_activity_tracker"
        });
        this.con.connect();
        console.log("Connected database");
    }

    connect() {
        if (this.con.connected) return;
        this.con.connect();
    }

    addEntry(projectId, entryType, entryData, callback) {
        let concreteEntryType = entryType == 0 ? 'WORK' : 'BREAK';
        this.con.query('insert into entries (PROJECT_ID, TYPE, START, END) values (?,?,?,?)', [projectId, concreteEntryType, entryData.start, entryData.end], (err, res) => {
            if (err) throw err;
            if (callback) callback();
        });
    }

    getEntries(projectId, callback) {
        console.log("Retrieved entries from DB");
        this.con.query('select * from entries where PROJECT_ID = ?', [projectId], (err, res) => {
            if (err) throw err;
            let entries = [];
            res.forEach(entry => {
                entries.push({
                    id: entry.ID,
                    type: entry.TYPE,
                    start: entry.START,
                    end: entry.END,
                    comment: entry.COMMENT
                });
            });

            if (callback) callback(entries);
        });
    }

    updateEntryComment(entryId, comment, callback) {
        this.con.query('UPDATE entries SET COMMENT=? WHERE ID=?', [comment, entryId], (err, res) => {
            if (err) throw err;
            if (callback) callback();
        });
    }

    addTodo(projectId, text, callback) {
        this.con.query('insert into todos (PROJECT_ID, TEXT, DONE) values (?,?,?)', [projectId, text, false], (err, res) => {
            if (err) throw err;
            if (callback) callback();
        })
    }

    getTodos(projectId, callback) {
        console.log("Retrieved todos from DB");
        this.con.query("select * from todos where PROJECT_ID = ? order by PRIORITY desc, TYPE desc, ID desc", [projectId], (err, res) => {
            if (err) throw err;
            let todos = [];
            res.forEach(todo => {
                todos.push({
                    id: todo.ID,
                    text: todo.TEXT,
                    done: todo.DONE,
                    priority: todo.PRIORITY,
                    type: todo.TYPE
                });
            });
            if (callback) callback(todos);
        })
    }

    updateTodo(todoId, done, callback) {
        this.con.query('UPDATE todos SET DONE=? WHERE ID=?', [done, todoId], (err, res) => {
            if (err) throw err;
            if (callback) callback();
        })
    }

    updateTodoPriority(todoId, priority, callback) {
        this.con.query('UPDATE todos SET PRIORITY=? WHERE ID=?', [priority, todoId], (err, res) => {
            if (err) throw err;
            if (callback) callback();
        })
    }

    updateTodoType(todoId, type, callback) {
        this.con.query('UPDATE todos SET TYPE=? WHERE ID=?', [type, todoId], (err, res) => {
            if (err) throw err;
            if (callback) callback();
        })
    }

    removeTodo(todoId, callback) {
        this.con.query("delete from todos WHERE ID = ?", [todoId], (err, res) => {
            if (err) throw err;
            if (callback) callback();
        })
    }

    addProject(project, callback) {
        this.con.query('insert into projects (NAME) VALUES (?)', [project], (err, res) => {
            if (err) throw err;
            if (callback) callback();
        })
    }

    removeProject(id, callback) {
        this.con.query('delete from projects where ID = ?', [id], (err, res) => {
            if (err) throw err;
            this.con.query('delete from entries where PROJECT_ID = ?', [id], (err, res) => {
                if (err) throw err;
                this.con.query('delete from todos where PROJECT_ID = ?', [id], (err, res) => {
                    if (err) throw err;
                    this.con.query('update notes set PROJECT_ID = -1 where PROJECT_ID = ?', [id], (err, res) => {
                        if (err) throw err;
                        if (callback) callback();
                    });
                });
            });
        })
    }

    getProjects(callback) {
        console.log("Retrieved projects from DB");
        this.con.query('select * from projects', (err, res) => {
            if (err) throw err;
            let projects = [];
            res.forEach(project => {
                projects.push({id: project.ID, name: project.NAME});
            });

            if (callback) callback(projects);
        });
    }

    createNote(noteId, callback) {
        this.con.query('insert into notes (ID, PROJECT_ID) VALUES (?, ?)', [noteId,-1], (err, res) => {
            if(err) throw err;
            if(callback) callback();
        })
    }

    removeNote(noteId, callback) {
        this.con.query('delete from notes where ID = ?', [noteId], (err, res) => {
            if (err) throw err;
            if (callback) callback();
        });
    }

    getNotes(callback) {
        console.log("Retrieved notes from DB");
        this.con.query('select * from notes', (err, res) => {
            if (err) throw err;
            let notes = {};
            res.forEach(note => {
                notes[note.ID] = {noteId: note.ID, title: note.TITLE, contents: note.CONTENTS, linkedProject: note.PROJECT_ID};
            });

            if (callback) callback(notes);
        });
    }

    updateNoteContents(noteId, noteContents, callback) {
        this.con.query('update notes set CONTENTS = ? WHERE ID = ?', [noteContents, noteId], (err, res) => {
           if(err) throw err;
           if(callback) callback();
        });
    }

    updateNoteTitle(noteId, noteTitle, callback) {
        this.con.query('update notes set TITLE = ? WHERE ID = ?', [noteTitle, noteId], (err, res) => {
            if(err) throw err;
            if(callback) callback();
        });
    }

    updateNoteLinkedProject(noteId, projectId, callback) {
        this.con.query('update notes set PROJECT_ID = ? WHERE ID = ?', [projectId, noteId], (err, res) => {
            if(err) throw err;
            if(callback) callback();
        });
    }

    async noteExists(noteId, callback) {
        let promise = new Promise((resolve, reject) => {
            this.con.query('select * from notes where ID = ?', [noteId], (err, res) => {
                if(err) {
                    reject();
                    throw err;
                }
                if(callback) callback();
                resolve(res.length > 0);
            })
        });
        return promise.then(result => result);
    }

    close() {
        if (!this.con.connected) return;
        this.con.end();
    }
}

module.exports = new Database();