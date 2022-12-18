const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const postData = require('./posts');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const helpers = require('../helpers');
const posts = require('./posts');


//make usernames case insensitive
// async function checkForUser(username){//checks whether username already exists return true or false
//     // try {
//     //     userCollection = await users();
//     // } catch (e){
//     //     console.log("o")
//     //     return false
//     // }
//     const userCollection = await users();
//     username.toLowerCase();
//     let users = []
//     const temp = await userCollection.find({}).toArray();
//     console.log(temp)
//     if (temp.length === 0 ) return false;
//     users= await userCollection.find({}).toArray();
//     console.log("o")
//     for(let i=0; i<users.length; i++){
//         if(users[i]['username'].toLowerCase() ===username){
//             return true;
//         }
//     }
//     return false;
// }

async function checkForUser(username){ //I made a new function because the other one does not work for some reason i cant figure out, yet somehow this one does
    const userCollection = await users();
    username = username.toLowerCase();
    const allUsers = await userCollection.find({}).toArray();
    for (let user of allUsers){
        let temp = "";
        if (user) temp = user.username;
        if (temp && temp === username) return true;
    }
    return false;
}

async function checkForEmail(email){ //I made a new function because the other one does not work for some reason i cant figure out, yet somehow this one does
    const userCollection = await users();
    email = email.toLowerCase();
    const allUsers = await userCollection.find({}).toArray();
    for (let user of allUsers){
        let temp = "";
        if (user) temp = user.email;
        if (temp && temp === email) return true;
    }
    return false;
}

async function createUser(firstName, lastName, email, username, password){//returns whole user object with id as a string
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
    if (firstName.length === 0 || lastName.length === 0 || email.length === 0 || username.length === 0 || password.length === 0) throw "An element cannot be only whitespace."
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
    if(!email.includes('.', at)){
        throw "not a proper email";
    }
    //username length of 5, no special characters only letters and numbers
    if(username.length<5 || helpers.containsSpec(username)){
        throw "not a valid username";
    }
    let checker = await this.checkForUser(username);
    if(checker){
        throw "username already exists";
    }
    let checker2 = await checkForEmail(email);
    if (checker2) throw "email already exists";
    if(password.length<5){
        throw "password is too short";
    }
    if(!(helpers.containsNum(password) || helpers.containsUpper(password) || 
    helpers.containsSpec(password)) || helpers.containsSpace(password)){
        throw "password needs a number, special character, and uppercase with no spaces"
    }

    const userCollection = await users()
    const hash = await bcrypt.hash(password, 10);
    let newUser = {firstName: firstName, lastName: lastName, email: email, username: username, password: hash, city: 'Hoboken', state: 'New Jersey', isAdmin: false, favorites: [], posts: [], reviews: [], comments: []};
    const insertInfo = await userCollection.insertOne(newUser);
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw "Error: could not add movie";
    }
    const newId = insertInfo.insertedId.toString();
    let user = await this.getUserById(newId);
    user['_id']=user['_id'].toString();
    return user;
}

async function getUserById(id){ //returns whole user with id as a string
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

async function changeFirstName(id, password, change){//returns user with userID as a string
    let user = this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    let pass=user['password'];
    let match=await bcrypt.compare(password, pass);
    if(!match){
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
    // if(user['firstName']==change){ Because of put implementation, im going to only check this in the route
    //     throw "name is the same as before";
    // }
    const update = {firstName: change};
    const info= await userCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: first name did not update";
    }
    return await this.getUserById(id);
}

async function changeLastName(id, password, change){//returns user with userID as a string
    let user = this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    let pass=user['password'];
    let match=await bcrypt.compare(password, pass);
    if(!match){
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
    // if(user['lastName']==change){
    //     throw "name is the same as before";
    // }
    const update = {lastName: change};
    const info= await userCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: last name did not update";
    }
    return await this.getUserById(id);
}

async function changeUsername(id, password, change){//returns user with userID as a string
    let user = this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    let pass=user['password'];
    let match=await bcrypt.compare(password, pass);
    if(!match){
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
    // if(user['username']==change){
    //     throw "username is the same as before";
    // }
    const update = {username: change};
    const info= await userCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: username did not update";
    }
    try{
        await posts.updatePostsByUser(id, change);
    }catch(e){
        console.log(e);
    }
    return await this.getUserById(id);
}

async function changePassword(id, password, change){//returns use with userID as a string
    let user = this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    let pass=user['password'];
    let match=await bcrypt.compare(password, pass);
    if(!match){
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
    const hash = await bcrypt.hash(password, 10);
    const update = {password: hash};
    const info= await userCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: password did not update";
    }
    return await this.getUserById(id);
}


async function makeAdmin(id){//returns suer with userDI as a string
    let user = await this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    const userCollection = await users();
    const update={isAdmin: true};
    const info= await userCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: name did not update";
    }
    return await this.getUserById(id);
}

async function changeEmail(id, password, change){//returns user with userID as a string
    let user = await this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    let pass=user['password'];
    let match=await bcrypt.compare(password, pass);
    if(!match){
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

async function deleteAccount(id, password){
    let user = await this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    let pass=user['password'];
    let match=await bcrypt.compare(password, pass);
    if(!match){
        throw "password does not match";
    }
    const userCollection = await users();
    const del = await userCollection.deleteOne({_id: ObjectId(id)});
    if(del.deleteCount==0){
        throw "Error: did not delete account";
    }
    return {deleted: true};
}

async function makePost(id, firstName, lastName, object, image, location, keywords){//returns postId of the new post
    let user = await this.getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    const newPost = await posts.createPost(firstName, lastName, object, image, location, keywords);
    let ogPosts = user['posts'];
    ogPosts.push(newPost);
    let userCollection = await users();
    const update = {posts: ogPosts};
    const info= await userCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: posts did not update";
    }
    return newPost;
}

async function makeComment(id, postID, username, comment){ //returns whole user of id with id as a string, id refers to userId
    let user = await getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    const newComment = await posts.createComment(postID, username, comment);
    let ogComments = user['comments'];
    ogComments.push(newComment);
    let userCollection = await users();
    const update = {comments: ogComments};
    const info= await userCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: posts did not update";
    }
    return await this.getUserById(id);
}
async function makeReview(id, postID, username, comment, rating){ //returns whole user of id with id as a string
    let user = await getUserById(id);
    if(user==null){
        throw "user does not exist";
    }
    const newReview = await posts.createReview(postID, username, comment, rating);
    let ogReviews = user['reviews'];
    ogReviews.push(newReview);
    let userCollection = await users();
    const update = {reviews: ogReviews};
    const info= await userCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: posts did not update";
    }
    return await this.getUserById(id);
}

async function approvePost(postID, userID, status){//send admin approval of post status to posts.js
    if(!postID || !userID || !status){
        throw "missing info for approval";
    }
    if(typeof postID!='string' || typeof userID!='string' || 
    typeof status!='string'){
        throw "type of info is wrong for approval";
    }
    postID.trim();
    userID.trim();
    status.trim();
    if(postID=='' || userID=='' || status==''){
        throw "postid, useris, or status is empty";
    }
    let user = this.getUserById(userID);
    try{
        let approved = posts.postApproval(postID, user['isAdmin'], status);
    }catch(e){
        console.log(e);
    }
    return approved;
}

async function favorite(userID, postID){//removes or adds favorite to post 
    if(!postID || !userID){
        throw "need postID and user ID";
    }
    if(typeof postID!='string' || typeof userID!= 'string'){
        throw "postID and userID needs to be a string";
    }
    postID.trim();
    userID.trim();
    if(postID==='' || !ObjectId.isValid(postID)){
        throw "postID is not a valid";
    }
    if(userID==='' || !ObjectId.isValid(userID)){
        throw "userID is not valid"
    }
    const userCollection = await users();
    const user = await getUserById(userID);
    let newFavorite = user['favorites'];
    let update;
    let info;
    if(user['favorites'].includes(postID)){
        try{
            await posts.removeFavorite(postID);
        }catch(e){
            console.log(e);
            return;
        }
        const index = newFavorite.indexOf(postID);
        newFavorite.splice(index, 1);
        update={favorites: newFavorite};
        info = await userCollection.updateOne({_id: ObjectId(userID)}, {$set: update});
    }
    else{
        try{
            await posts.favoritePost(postID);
        }catch(e){
            console.log(e);
            return;
        }
        newFavorite.push(postID);
        update={favorites: newFavorite};
        info = await postCollection.updateOne({_id: ObjectId(userID)}, {$set: update});
    }
    if(info.modifiedCount==0){
        throw "Favorites did not update"
    }
    return {favoriteInserted: true};
    
}

//


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
  if (!helpers.containsSpec(password) && !helpers.containsPunct(password)) throw "Error: Password must contain atleast one special character.";
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
    changeEmail,
    changeFirstName,
    changeLastName,
    makeAdmin,
    checkUser,
    getUserById,
    addFavorite,
    addComment,
    addRating,
    makePost,
    makeComment,
    makeReview,
    checkForUser,
    deleteAccount,
    approvePost,
    checkForEmail,
    favorite
};