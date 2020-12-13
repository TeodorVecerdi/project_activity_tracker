let mysql = require("mysql");
const username = "teodor";
const password = "6RABDh5PLIOD6m8R";
const database = "project_activity_tracker"
const url = `mongodb+srv://${username}:${password}@cluster0.59los.mongodb.net/`


class Database {
    constructor() {
        this.con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "project_activity_tracker"
        });
        this.con.connect();
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

    removeProject(id, callback) {
        this.con.query('delete from projects where ID = ?', [id], (err, res) => {
            if(err) throw err;
            if(callback) callback();
        })
    }

    getProjects(callback) {
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