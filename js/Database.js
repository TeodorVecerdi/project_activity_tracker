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
        if(this.con.connected) return;
        this.con.connect();
    }

    addProject(project, callback) {
        this.con.query('insert into projects (NAME) VALUES (?)', [project], (err, res) => {
            if(err) throw err;
            if(callback) callback();
        })
    }

    addEntry(projectId, entryType, entryData, callback) {
        let concreteEntryType = entryType == 0 ? 'WORK' : 'BREAK';
        this.con.query('insert into entries (PROJECT_ID, TYPE, START, END) values (?,?,?,?)', [projectId, concreteEntryType, entryData.start, entryData.end], (err, res) => {
            if(err) throw err;
            if(callback) callback();
        });
    }

    removeProject(id, callback) {
        this.con.query('delete from projects where ID = ?', [id], (err, res) => {
            if(err) throw err;
            if(callback) callback();
        })
    }

    getProjects(callback) {
        console.log("Retrieved projects from DB");
        this.con.query('select * from projects', (err, res, fields) => {
            if(err) throw err;
            let projects = [];
            res.forEach(project => {
               projects.push({id: project.ID, name: project.NAME});
            });

            if(callback) callback(projects);
        })
    }

    close() {
        if(!this.con.connected) return;
        this.con.end();
    }
}

module.exports = new Database();