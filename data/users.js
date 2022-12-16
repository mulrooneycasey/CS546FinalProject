const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

async function createUser(firstName, lastName, email, username, password, city, state){

}

async function changeUsername(){

}

async function changePassword(){

}

module.exports = {
    createUser,
    changeUsername,
    changePassword
};