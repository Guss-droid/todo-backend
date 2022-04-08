const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers
  const user = users.find(user => user.username === username)

  if (!user) {
    return res.status(404).json({ error: "Username not exists" })
  }

  req.user = user

  return next()
}

app.post('/users', (req, res) => {
  const { name, username } = req.body

  if (!name || !username) {
    return res.status(400).json({ error: "Missing informations" })
  }

  const userAlreadyExists = users.some(user => user.username === username)

  if (userAlreadyExists) {
    return res.status(400).json({ error: "User already exists" })
  }

  const user = {
    id: uuid(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return res.status(201).json(user)
});

app.use(checksExistsUserAccount)

app.get('/todos', (req, res) => {
  const { user } = req

  return res.status(200).json(user.todos)
});

app.post('/todos', (req, res) => {
  const { title, deadline } = req.body
  const { user } = req

  if (!title | !deadline) {
    return res.status(400).json({ error: "Missing informations" })
  }

  const newTodo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return res.status(201).json(newTodo)
});

app.put('/todos/:id' ,(req, res) => {
  const { user } = req
  const { title, deadline } = req.body
  const { id } = req.params

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" })
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return res.json(todo)
});

app.patch('/todos/:id/done', (req, res) => {
  const { id } = req.params
  const { user } = req

  const todo = user.todos.find(todoId => todoId.id === id)

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" })
  }

  todo.done = true

  return res.status(200).json(todo)
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params
  const { user } = req

  const todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" })
  }

  user.todos.splice(todo, 1)

  return res.status(204).json()
});

module.exports = app;