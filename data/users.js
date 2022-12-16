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

async function addFavorite(postId){
  const userCollection = await users();
  
}

const checkUser = async (email, password) => { //I just ripped this off of my lab 10 - Nick
  if (!email) throw "Error: Must supply email.";
  if (!password) throw "Error: Must supply password.";
  email = email.trim().toLowerCase();
  
  if (typeof password != 'string') throw "Error: Password must be a string.";
  password = password.trim();
  const userCollection = await users();

  let tempArray = await userCollection.find({}).toArray();
  for (let user of tempArray){
    let currentUser = user['email'];
    if (email === currentUser) {
      let theSame = await bcrypt.compare(password, user['password']);
      if (theSame) {
        return user
      }
      else {
        throw "Error: Either the email or the password is invalid.";
      }
    }
  }
  throw "Error: Either the email or the password is invalid.";
};

module.exports = {
    createUser,
    changeUsername,
    changePassword,
    checkUser,
    addFavorite
};