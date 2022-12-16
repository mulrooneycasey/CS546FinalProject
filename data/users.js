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

const checkUser = async (username, password) => { //I just ripped this off of my lab 10 - Nick
  if (!username) throw "Error: Must supply username.";
  if (!password) throw "Error: Must supply password.";
  if (typeof username != 'string') throw "Error: Username must be a string.";
  username = username.trim().toLowerCase();
  if (username === "") throw "Error: Username cannot be only whitespace.";
  if (username.length < 4) throw "Error: Username must be atleast 4 characters aside from bordering whitespace.";
  if (helpers.containsSpace(username) || helpers.containsPunct(username) || helpers.containsSpec(username)) throw "Error: Username contains an illegal character, such as whitespace or a special character.";
  
  if (typeof password != 'string') throw "Error: Password must be a string.";
  password = password.trim();
  if (password === "") throw "Error: Password cannot be only whitespace."
  if (helpers.containsSpace(password)) throw "Error: Password cannot contain a whitespace within.";
  if (password.length < 6) throw "Error: Password must be atleast 6 characters aside from bordering whitespace.";
  if (!helpers.containsUpper(password)) throw "Error: Password must contain atleast one uppercase character.";
  if (!helpers.containsNum(password)) throw "Error: Password must contain atleast one number.";
  if (!helpers.containsSpec(password)) throw "Error: Password must contain atleast one special character.";

  const userCollection = await users();

  let tempArray = await userCollection.find({}).toArray();
  for (let user of tempArray){
    let currentUser = user['username'];
    if (username === currentUser) {
      let theSame = await bcrypt.compare(password, user['password']);
      if (theSame) {
        return user
      }
      else {
        throw "Error: Either the username or the password is invalid.";
      }
    }
  }
  throw "Error: Either the username or the password is invalid.";
};

module.exports = {
    createUser,
    changeUsername,
    changePassword
};