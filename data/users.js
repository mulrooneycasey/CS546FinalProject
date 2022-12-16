const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const postData = require('./posts');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

async function createUser(firstName, lastName, email, username, password, city, state){

}

async function changeUsername(){

}

async function changePassword(){

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
  if(user===null){
      throw "no post with that id";
  }
  user['_id']===user['_id'].toString();
  return post;
}

async function addFavorite(postId, userId){
  if (!postId) throw "Error: Must supply postId";
  if (typeof postId != 'string') throw "Error: postId must be a string";
  postId = postId.trim();
  if (postId.length() === 0) throw "Error: postId cannot be only whitespace";
  if (!ObjectId.isValid(postId)) throw "Error: postId is not a valid objectId"; //dumb question but should it be a string still at first? - Nick

  if (!userId) throw "Error: Must supply userId";
  if (typeof userId != 'string') throw "Error: userId must be a string";
  userId = userId.trim();
  if (userId.length() === 0) throw "Error: userId cannot be only whitespace";
  if (!ObjectId.isValid(userId)) throw "Error: userId is not a valid objectId"; //dumb question but should it be a string still at first? - Nick

  const userCollection = await users();
  const user = await getUserById(userId);
  
  try {
    const thePost = await postData.getPostById(postId);
  } catch (e){
    throw "Error: No post with that Id.";
  }

  let newFavorites = user['favorites'];
  newFavorites.push(postId);

  let newUser = {};
  newUser['firstName'] = user['firstName'];
  newUser['lastName'] = user['lastName'];
  newUser['email'] = user['email'];
  newUser['username'] = user['username'];
  newUser['city'] = user['city'];
  newUser['state'] = user['state'];
  newUser['isAdmin'] = user['isAdmin']
  newUser['favorites'] = newFavorites;
  newUser['posts'] = user['posts'];
  newUser['ratings'] = user['ratings'];
  newUser['comments'] = user['comments'];

  const updatedInfo = await userCollection.updateOne(
    {_id: ObjectId(userId)},
    {$set: newUser}
  );
  if (updatedInfo.modifiedCount === 0) {
    throw 'Error: could not update favorites successfully';
  }

  return {favoriteInserted: true};
}

const checkUser = async (email, password) => { //I just ripped this off of my lab 10 - Nick
  if (!email) throw "Error: Must supply email.";
  if (!password) throw "Error: Must supply password.";
  if (typeof email != 'string') throw "Error: email must be a string.";
  email = email.trim().toLowerCase();
  if (email === "") throw "Error: email cannot be only whitespace.";
  if (email.length < 4) throw "Error: email must be atleast 4 characters aside from bordering whitespace.";
  if (helpers.containsSpace(email)) throw "Error: email contains an illegal character, such as whitespace.";
  
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

async function addRating(reviewId, userId){
  if (!reviewId) throw "Error: Must supply reviewId";
  if (typeof reviewId != 'string') throw "Error: reviewId must be a string";
  reviewId = reviewId.trim();
  if (reviewId.length() === 0) throw "Error: reviewId cannot be only whitespace";
  if (!ObjectId.isValid(reviewId)) throw "Error: reviewId is not a valid objectId"; //dumb question but should it be a string still at first? - Nick

  if (!userId) throw "Error: Must supply userId";
  if (typeof userId != 'string') throw "Error: userId must be a string";
  userId = userId.trim();
  if (userId.length() === 0) throw "Error: userId cannot be only whitespace";
  if (!ObjectId.isValid(userId)) throw "Error: userId is not a valid objectId"; //dumb question but should it be a string still at first? - Nick

  const userCollection = await users();
  const user = await getUserById(userId);
  
  //Maybe should check if the review exists? but not exactly because this is used with createReview soo

  let newRatings = user['ratings'];
  newRatings.push(reviewId);
  

  let newUser = {};
  newUser['firstName'] = user['firstName'];
  newUser['lastName'] = user['lastName'];
  newUser['email'] = user['email'];
  newUser['username'] = user['username'];
  newUser['city'] = user['city'];
  newUser['state'] = user['state'];
  newUser['isAdmin'] = user['isAdmin']
  newUser['favorites'] = user['favorites']
  newUser['posts'] = user['posts'];
  newUser['ratings'] = newRatings
  newUser['comments'] = user['comments'];

  const updatedInfo = await userCollection.updateOne(
    {_id: ObjectId(userId)},
    {$set: newUser}
  );
  if (updatedInfo.modifiedCount === 0) {
    throw 'Error: could not update favorites successfully';
  }

  return {ratingInserted: true};
}

async function addComment(commentId, userId){
  if (!commentId) throw "Error: Must supply commentId";
  if (typeof commentId != 'string') throw "Error: commentId must be a string";
  commentId = commentId.trim();
  if (commentId.length() === 0) throw "Error: commentId cannot be only whitespace";
  if (!ObjectId.isValid(commentId)) throw "Error: commentId is not a valid objectId"; //dumb question but should it be a string still at first? - Nick

  if (!userId) throw "Error: Must supply userId";
  if (typeof userId != 'string') throw "Error: userId must be a string";
  userId = userId.trim();
  if (userId.length() === 0) throw "Error: userId cannot be only whitespace";
  if (!ObjectId.isValid(userId)) throw "Error: userId is not a valid objectId"; //dumb question but should it be a string still at first? - Nick

  const userCollection = await users();
  const user = await getUserById(userId);
  
  //Maybe should check if the review exists? but not exactly because this is used with createReview soo

  let newComments = user['comments'];
  newComments.push(commentId);
  

  let newUser = {};
  newUser['firstName'] = user['firstName'];
  newUser['lastName'] = user['lastName'];
  newUser['email'] = user['email'];
  newUser['username'] = user['username'];
  newUser['city'] = user['city'];
  newUser['state'] = user['state'];
  newUser['isAdmin'] = user['isAdmin']
  newUser['favorites'] = user['favorites']
  newUser['posts'] = user['posts'];
  newUser['ratings'] = user['ratings']
  newUser['comments'] = newComments

  const updatedInfo = await userCollection.updateOne(
    {_id: ObjectId(userId)},
    {$set: newUser}
  );
  if (updatedInfo.modifiedCount === 0) {
    throw 'Error: could not update favorites successfully';
  }

  return {commentInserted: true};
}

module.exports = {
    createUser,
    changeUsername,
    changePassword,
    checkUser,
    getUserById,
    addFavorite,
    addComment,
    addRating
};