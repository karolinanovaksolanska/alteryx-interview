const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const shortid = require('shortid')

const adapter = new FileSync('db.json')
const db = low(adapter)

module.exports = {
    register,
    authenticate,
    logout,
    getAll,
    getById,
    update,
    delete: _delete
};

async function register(props) {
    let { username, password } = props;
    let { databaseNameUsers } = config;

    if (!username || !password){
        throw 'Missing arguments in a call';
    }

    const userTest = await db.get(databaseNameUsers).find({ username: username }).value()
    if (userTest) {
        throw 'Username ' + username + ' is already taken';
    }

    let user = {
        id: shortid.generate(),
        username: username
    }
    if (password) {
        user.hash = bcrypt.hashSync(password, 10);
    }

    await db.get(databaseNameUsers).push(user).write()
}

async function authenticate(props) {
    let { username, password } = props;
    let { databaseNameUsers, secret } = config;

    if (!username || !password){
        throw 'Missing arguments in a call';
    }

    const user = await db.get(databaseNameUsers).find({ username: username }).value();
    if (user && bcrypt.compareSync(password, user.hash)) {
        const userWithoutHash = {
            username: user.username,
            id: user.id
        }
        const token1 = jwt.sign({ sub: user.id }, secret, {expiresIn: 60 * 30}); //expires in 30 minutes
        return {
            userWithoutHash,
            token1
        };
    }
}

async function logout(headers) {
    let { authorization } = headers;
    let { databaseNameBlacklistTokens } = config;

    if (!authorization){
        throw 'Missing arguments in a call';
    }

    await db.get(databaseNameBlacklistTokens).push({token: authorization}).write()
}

async function getAll(headers) {
    let { databaseNameUsers } = config;

    await isLoggedOut(headers.authorization);

    return await db.get(databaseNameUsers).value()
}

async function getById(userId, headers) {
    let { databaseNameUsers } = config;

    await isLoggedOut(headers.authorization);

    return await db.get(databaseNameUsers).find({ id: userId }).value()
}

async function _delete(userId, headers) {
    let { databaseNameUsers } = config;

    await isLoggedOut(headers.authorization);

    await db.get(databaseNameUsers).remove({ id: userId }).write()
}

async function update(userId, props, headers) {
    let { databaseNameUsers } = config;
    let { username, password } = props;

    await isLoggedOut(headers.authorization);

    let user = await db.get(databaseNameUsers).find({ id: userId }).value()

    if (!user) {
        throw 'User not found';
    }

    if (user.username !== username && await db.get(databaseNameUsers).find({ username: username }).value()) {
        throw 'Username ' + username + ' is already taken';
    } else {
        await db.get(databaseNameUsers).find({ id: userId }).assign({ username: username}).write()
    }

    if (password) {
        let newHash = bcrypt.hashSync(password, 10);
        await db.get(databaseNameUsers).find({ id: userId }).assign({ hash: newHash}).write()
    }
}



async function isLoggedOut(token1){
    let { databaseNameBlacklistTokens } = config;
    const tokenTest = await db.get(databaseNameBlacklistTokens).find({ token: token1 }).value()
    if (tokenTest) {
        throw 'User is logged out.';
    }
}