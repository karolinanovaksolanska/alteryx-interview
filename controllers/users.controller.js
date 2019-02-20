const express = require('express');
const router = express.Router();
const users = require('../services/user.service');

router.post('/register', userRegisterHandler);
router.post('/authenticate', userAuthenticateHandler);
router.get('/logout', userLogoutHandler);
router.get('/get-all-users', getAllUsersHandler);
router.get('/get-one-user/:id', getUserByIdHandler);
router.put('/update-one-user/:id', updateUserHandler);
router.delete('/delete-one-user/:id', _deleteUserHandler);

module.exports = router;

function userRegisterHandler(req, res, next) {
    users.register(req.body)
        .then(() => res.status(200).json("User registered."))
        .catch(err => next(err));
}

function userAuthenticateHandler(req, res, next) {
    users.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function userLogoutHandler(req, res, next) {
    users.logout(req.headers)
        .then(() => res.status(200).json("User logged out."))
        .catch(err => next(err));
}

function getAllUsersHandler(req, res, next) {
    users.getAll(req.headers)
        .then(users => res.json(users))
        .catch(err => next(err));
}


function getUserByIdHandler(req, res, next) {
    users.getById(req.params.id, req.headers)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function updateUserHandler(req, res, next) {
    users.update(req.params.id, req.body, req.headers)
        .then(() => res.status(200).json("User updated."))
        .catch(err => next(err));
}

function _deleteUserHandler(req, res, next) {
    users.delete(req.params.id, req.headers)
        .then(() => res.status(200).json("User deleted."))
        .catch(err => next(err));
}