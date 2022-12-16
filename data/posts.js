const mongoCollections = require('../config/mongoCollections');
const posts = mongoCollections.posts;
const {ObjectId} = require('mongodb');
const bcrypt = require('bcrypt');
const helpers = require('../helpers');

async function createPost(firstName, lastName, object, image, location){
    if(!firstName || !lastName || !object || !image || !location){
        throw "missing item";
    }
    if(helpers.containsNum(firstName) || helpers.containsNum(lastName)){
        throw "name cannot have numbers in it";
    }
    if(typeof firstName!='string' || typeof lastName!='string' ||
    typeof location!='string' || typeof object!='string'){
        throw "first name, last name, location, and object has to be a string";
    }
    //im assuming an object is supposed to be a string description
    firstName.trim();
    lastName.trim();
    location.trim();
    object.trim();
    if(firstname=='' || lastName=='' || location=='' || object==''){
        throw "first name, last name, location, and object has to be a string";
    }
    
    //not sure how to do images with mongodb

    const postCollection = await posts();
    let newPost = {firstName: firstName, lastName: lastName, object: object, image: image, location: location};
    const insertInfo = await postCollection.insertOne(newPost);
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw "Could not add post";
    }
    return;
}

async function getPostById(id){
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
    const postCollection = await posts();
    let post= await postCollection.findOne({_id: ObjectId(id)});
    if(post==null){
        throw "no post with that id";
    }
    post['_id']=post['_id'].toString();
    return post;
}

async function createReview(postID, username, comment, rating){
    if(!postID || !username || !comment || !rating){
        throw "missing info for review";
    }
    if(typeof postID!='string' || typeof username!='string' || 
    typeof comment!='string' || typeof rating!='number'){
        throw "type of info is wrong for review";
    }
    postID.trim();
    username.trim();
    comment.trim();
    if(postID=='' || username=='' || comment==''){
        throw "postid, username, or comment is empty";
    }
    if(rating<1 || rating>5){
        throw "rating needs to be 1-5";
    }
    if(!ObjectId.isValid(postID)){
        throw "not valid post id";
    }
    const newReview = {username: username, comment: comment, rating: rating, _id: new ObjectId()};
    const postCollection = await posts();
    const original = getPostById(postID);
    const reviews=original['reviews'];
    let update;
    if(reviews==null){
        update.reviews=[newReview];
    }
    else{
        update.reviews.push(newReview);
    }
    //I think we need to add something to calculate overall rating? - Nick reviewLater
    const info = await postCollection.updateOne({_id: ObjectId(postID)}, {$set: update});
    if(info.modifiedCount==0){
        throw "post did not update";
    }
    return newReview['_id'];
}

async function createComment(postID, username, comment){
    if(!postID || !username || !comment){
        throw "missing info for review";
    }
    if(typeof postID!='string' || typeof username!='string' || 
    typeof comment!='string'){
        throw "type of info is wrong for review";
    }
    postID.trim();
    username.trim();
    comment.trim();
    if(postID=='' || username=='' || comment==''){
        throw "postid, username, or comment is empty";
    }
    if(!ObjectId.isValid(postID)){
        throw "not valid post id";
    }
    const newComment = {username: username, comment: comment};
    const postCollection = await posts();
    const original = getPostById(postID);
    const comments=original['comments'];
    let update;
    if(comments==null){
        update.comments=[newComment];
    }
    else{
        update.comments.push(newComment);
    }
    const info = await postCollection.updateOne({_id: ObjectId(postID)}, {$set: update});
    if(info.modifiedCount==0){
        throw "post did not update";
    }
    return;
}

async function getAllPosts(){
  const postCollection = await posts();
  const postList = await postCollection.find({}).toArray();
  if (!postList) throw 'Error: Could not get all posts';

  for (const post of postList){ //turn to strings for use in getPostById
    post["_id"] = post["_id"].toString();
  }
  return postList;
}

//This function is to get, starting from an index, numberPosts posts, with the most recent ones being first
async function getPostsByIndex(startingIndex, numberPosts){
    if (!startingIndex) throw "Error: No startingIndex";
    if (typeof startingIndex !== 'number') throw "Error: startingIndex must be a number.";
    if (startingIndex < 0) throw "Error: Cannot have a negative startingIndex";
    if (!numberPosts) throw "Error: No numberPosts";
    if (typeof numberPosts !== 'number') throw "Error: numberPosts must be a number.";
    if (numberPosts < 0) throw "Error: Cannot have a negative numberPosts";
    
    const postList = await getAllPosts();
    if (startingIndex > postList.length -1) throw "Error: Index cannot exceed length of all posts";
    if (startingIndex + numberPosts - 1) throw "Error: Posts exceeded the number of total posts";

    for (let post of postList){
        let date = post['date'];
        let time = post['time'];

    }

}

tempo = new Date();
console.log(tempo);
console.log(tempo.toDateString())
console.log(tempo.toTimeString())
idk = "";
idk = tempo.toDateString() + " " + tempo.toTimeString();
console.log(new Date(idk))


module.exports = {
    createPost,
    createReview,
    getAllPosts,
    getPostById,
    createComment
};