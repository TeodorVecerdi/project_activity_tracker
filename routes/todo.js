let express = require('express');
let router = express.Router();
let database = require('../js/Database');
let serverState = require('../js/ServerState');

router.get('/', (req, res, next) => {
    res.render('pages/todo', {"activeTab": "todo"});
});

router.post('/add-todo', (req, res, next) => {
    let selectedProject = serverState.selectedProject;
    if (selectedProject === undefined) res.status(404).end();

    let todoText = req.body.todoItem;

    database.addTodo(selectedProject, todoText);
    serverState.todosDirty = true;
    res.status(200).end();
});

router.get('/get-todos', (req, res, next) => {
    let selectedProject = serverState.selectedProject;
    if (selectedProject === undefined) res.status(404).end();

    if(serverState.todosDirty) {
        database.getTodos(selectedProject, todos => {
            serverState.todos = [... todos];
            serverState.todosDirty = false;

            res.status(200).send({todos: todos});
        })
    } else {
        res.status(200).send({todos: serverState.todos});
    }
});

router.post('/update-todo', (req, res, next) => {
    let todoId = req.body.id;
    let todoStatus = req.body.status == 'true';

    database.updateTodo(todoId,todoStatus, () => {
        let changedIndex = serverState.todos.findIndex(todo => todo.id == todoId);
        if(changedIndex === -1) serverState.todosDirty = true;
        else serverState.todos[changedIndex].done = todoStatus;
        res.status(200).end();
    })
});

router.post('/remove-todo', (req, res, next) => {
    let todoId = req.body.id;

    database.removeTodo(todoId, () => {
        serverState.todos = serverState.todos.filter(todo => todo.id != todoId);
        res.status(200).end();
    })
});

module.exports = {url: "/todo", router: router};