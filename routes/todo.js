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
    res.status(201).end();
});

router.get('/get-todos', (req, res, next) => {
    let selectedProject = serverState.selectedProject;
    if (selectedProject === undefined) res.status(404).end();

    if(req.query.hasOwnProperty('makeDirty')) {
        let makeDirty = req.query['makeDirty'] == 'true';
        if(makeDirty) serverState.todosDirty = true;
    }

    if (serverState.todosDirty) {
        database.getTodos(selectedProject, todos => {
            serverState.todos = [...todos];
            serverState.todosDirty = false;

            res.status(200).send({todos: todos});
        })
    } else {
        res.status(200).send({todos: serverState.todos});
    }
});

router.patch('/update-todo', (req, res, next) => {
    let todoId = req.body.id;
    let todoStatus = req.body.status == 'true';

    let changedIndex = serverState.todos.findIndex(todo => todo.id == todoId);
    if (changedIndex === -1) {
        res.status(404).end();
        serverState.todosDirty = true;
    }

    database.updateTodo(todoId, todoStatus, () => {
        if (changedIndex !== -1) serverState.todos[changedIndex].done = todoStatus;
        res.status(200).end();
    });
});

router.patch('/update-todo-priority', (req, res, next) => {
    let todoId = req.body.id;
    let todoPriority = req.body.priority;

    let changedIndex = serverState.todos.findIndex(todo => todo.id == todoId);
    if (changedIndex === -1) {
        res.status(404).end();
        serverState.todosDirty = true;
    }

    database.updateTodoPriority(todoId, todoPriority, () => {
        if (changedIndex !== -1) serverState.todos[changedIndex].priority = todoPriority;
        res.status(200).end();
    });
});

router.patch('/update-todo-type', (req, res, next) => {
    let todoId = req.body.id;
    let todoType = req.body.type;

    let changedIndex = serverState.todos.findIndex(todo => todo.id == todoId);
    if (changedIndex === -1) {
        res.status(404).end();
        serverState.todosDirty = true;
    }

    database.updateTodoType(todoId, todoType, () => {
        if (changedIndex !== -1) serverState.todos[changedIndex].type = todoType;
        res.status(200).end();
    });
});

router.delete('/remove-todo', (req, res, next) => {
    let todoId = req.body.id;
    let removedIndex = serverState.todos.findIndex(todo => todo.id == todoId);

    if (removedIndex === -1) {
        res.status(404).end();
        serverState.todosDirty = true;
    }

    database.removeTodo(todoId, () => {
        serverState.todos = serverState.todos.filter(todo => todo.id != todoId);
        res.status(200).end();
    })
});

module.exports = {url: "/todo", router: router};