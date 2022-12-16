const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const helpers = require('../helpers');

//make usernames case insensitive
async function createUser(firstName, lastName, email, username, password){
    if(!firstName || !lastName || !email || !username || !password){
        throw "to sign up need a first name, last name, email address, username, and password";
    }
    if(typeof firstName!='string' || typeof lastName!='string' || typeof email!='string' ||
    typeof username!='string' || typeof password!='string'){
        throw "inputs are not valid strings";
    }
    firstName.trim();
    lastName.trim();
    email.trim();
    username.trim();
    password.trim();
    if(firstName.length<3 || lastName.length<3){
        throw "first name or last name are too short";
    }
    if(helpers.containsNum(firstName) || helpers.containsNum(lastName)){
        throw "first name and last name cannot contain numbers";
    }
    const at = email.indexOf('@');
    if(at ==-1){
        throw "not a proper email";
    }
    if(email.includes('.', at)){
        throw "not a proper email";
    }
    //username length of 5, no special characters only letters and numbers
    if(username.length<5 || helpers.containsSpec(username)){
        throw "not a valid username";
    }
    if(password.length<5){
        throw "password is too short";
    }
    if(!(helpers.containsNum(password) || helpers.containsUpper(password) || 
    helpers.containsSpec(password)) || helpers.containsSpace(password)){
        throw "password needs a number, special character, and uppercase with no spaces"
    }

    const userCollection = await users()
    //need to hash the password
    let newUser = {firstName: firstName, lastName: lastName, email: email, username: username, password: password, city: 'Hoboken', state: 'New Jersey', isAdmin: false, favorites: [], posts: [], rating: [], comments: []};
    const insertInfo = await userCollection.insertOne(newUser);
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw "Error: could not add movie";
    }
    const newId = insertedInfo.insertedId.toString();
    let user = await this.getUserById(newId);
    user['_id']=user['_id'].toString();
    return user;
}

async function getUserById(id){
    if(!id){
        throw "Error: no id provided";
    }
    if(typeof id!='string' || id.trim()==''){
        throw "Error: id is not a valid string";
    }
    id=id.trim();
    if(!ObjectId.isValid(id)){
        throw "Error: id is not valid";
    }
    const userCollection = await users();
    let user= await userCollection.findOne({_id: ObjectId(id)});
    if(user==null){
        throw "no post with that id";
    }
    user['_id']=user['_id'].toString();
    return user;
}

//need to unhash passwords for this
async function changeFirstName(id, password, change){
    let user = this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    let pass=user.password;

    if(pass!=password){
        throw "password does not match";
    }
    if(!change || typeof change!='string'){
        throw "first name must be at least 3 letters";
    }
    change.trim()
    if(change.length<3){
        throw "first name must be at least 3 letters";
    }
    if(helpers.containsNum(change) || helpers.containsPunct(change) || helpers.containsSpec(change)){
        throw "first name cannot have numbers punctuation, or special characters";
    }
    const userCollection = await users();
    if(users['firstName']==change){
        throw "name is the same as before";
    }
    const update = {firstName: change};
    const info= await userCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: name did not update";
    }
    return await this.getUserById(id);
}

async function changeLastName(id, password, change){
    let user = this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    let pass=user.password;

    if(pass!=password){
        throw "password does not match";
    }
    if(!change || typeof change!='string'){
        throw "first name must be at least 3 letters";
    }
    change.trim()
    if(change.length<3){
        throw "last name must be at least 3 letters";
    }
    if(helpers.containsNum(change) || helpers.containsPunct(change) || helpers.containsSpec(change)){
        throw "last name cannot have numbers punctuation, or special characters";
    }
    const userCollection = await users();
    if(users['lastName']==change){
        throw "name is the same as before";
    }
    const update = {lastName: change};
    const info= await userCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: name did not update";
    }
    return await this.getUserById(id);
}

async function changeUsername(id, password, change){
    let user = this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    let pass=user.password;

    if(pass!=password){
        throw "password does not match";
    }
    if(!change || typeof change!='string'){
        throw "first name must be at least 3 letters";
    }
    change.trim()
    if(change.length<3){
        throw "username must be at least 3 letters";
    }
    if(helpers.containsNum(change) || helpers.containsPunct(change) || helpers.containsSpec(change)){
        throw "username cannot have numbers punctuation, or special characters";
    }
    const userCollection = await users();
    if(users['username']==change){
        throw "username is the same as before";
    }
    const update = {username: change};
    const info= await userCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: name did not update";
    }
    return await this.getUserById(id);
}

async function changePassword(id, password, change){
    let user = this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    let pass=user.password;

    if(pass!=password){
        throw "password does not match";
    }
    if(!change || typeof change!='string'){
        throw "first name must be at least 3 letters";
    }
    change.trim();
    if(change.length<5){
        throw "password is too short";
    }
    if(!(helpers.containsNum(change) || helpers.containsUpper(change) || 
    helpers.containsSpec(change)) || helpers.containsSpace(change)){
        throw "password needs a number, special character, and uppercase with no spaces"
    }
    const userCollection = await users();
    if(pass==change){
        throw "password is the same as before";
    }
    //
    const update = {password: change};
    const info= await userCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: name did not update";
    }
    return await this.getUserById(id);
}

async function makeAdmin(id){
    let user = this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    const update={isAdmin: true};
    const info= await movieCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: name did not update";
    }
    return await this.getUserById(id);
}

async function changeEmail(id, password, change){
    let user = this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    let pass=user.password;

    if(pass!=password){
        throw "password does not match";
    }
    if(!change || typeof change!='string'){
        throw "email must be at least 3 letters";
    }
    change.trim()
    const at = email.indexOf('@');
    if(at ==-1){
        throw "not a proper email";
    }
    if(email.includes('.', at)){
        throw "not a proper email";
    }
    const userCollection = await users();
    if(users['email']==change){
        throw "email is the same as before";
    }
    const update = {email: change};
    const info= await userCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: name did not update";
    }
    return await this.getUserById(id);
}



module.exports = {
    createUser,
    changeUsername,
    changePassword,
    changeEmail,
    changeFirstName,
    changeLastName,
    makeAdmin,
    getUserById
};