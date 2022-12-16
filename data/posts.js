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
    const d = new Date();
    const date = (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear();
    time=d.getTime();
    let newPost = {firstName: firstName, lastName: lastName, description: object, image: image, 
        location: location, time: time, date: date, overallRating: 5, reviews: [], comments: [], status: "pending"};
    const insertInfo = await postCollection.insertOne(newPost);
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw "Could not add post";
    }
    const newId = insertInfo.insertedId.toString();
    return newId;
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
    const newReview = {username: username, ratingNum: rating, comment: comment};
    const postCollection = await posts();
    const original = getPostById(postID);
    const uReviews=original['reviews'];
    let update;
    //do i need to make a database for reviews and comments
    uReviews.push(newReview);
    let rating = 0;
    for(let i=0; i<uReviews.length; i++){
        rating+=uReviews[i].ratingNum;
    }
    rating = rating/uReviews.length;
    update={overallRating: rating, reviews: uReviews};
    const info = await postCollection.updateOne({_id: ObjectId(postID)}, {$set: update});
    if(info.modifiedCount==0){
        throw "post did not update";
    }
    return newReview;
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
    return newComment;
}

module.exports = {
    createPost,
    createReview,
    createComment
};