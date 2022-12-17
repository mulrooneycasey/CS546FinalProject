const mongoCollections = require('../config/mongoCollections');
const posts = mongoCollections.posts;
const {ObjectId} = require('mongodb');
const bcrypt = require('bcrypt');
const helpers = require('../helpers');

async function createPost(firstName, lastName, object, image, location, keywords){ //returns postId
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
    if(typeof keywords != ' undefined' && typeof keywords != 'string'){
        throw "keywords has to be a string";
    }
    firstName.trim();
    lastName.trim();
    location.trim();
    object.trim();
    keywords.trim();
    if(firstName=='' || lastName=='' || location=='' || object==''){
        throw "first name, last name, location, and object has to be a string";
    }

    //not sure how to do images with mongodb

    const postCollection = await posts();
    const d = new Date();
    const date = (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear();
    time=d.toTimeString();
    let newPost = {firstName: firstName, lastName: lastName, description: object, image: image,
        location: location, time: time, date: date, overallRating: 5, reviews: [], comments: [], status: "pending", keywords: keywords};
    const insertInfo = await postCollection.insertOne(newPost);
    if(!insertInfo.acknowledged || !insertInfo.insertedId){
        throw "Could not add post";
    }
    const newId = insertInfo.insertedId.toString();
    return newId;
}

async function getPostById(id){ //returns whole post object with postId as a string
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
    if(post===null){
        throw "no post with that id";
    }
    post['_id']=post['_id'].toString();
    return post;
}

async function createReview(postID, username, comment, rating){ //returns whole review with its id as a objectId
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
    const original = await getPostById(postID);
    const uReviews=original['reviews'];
    let update;
    uReviews.push(newReview);
    rating = 0;
    for(let i=0; i<uReviews.length; i++){
        rating+=uReviews[i]['rating'];
    }
    rating = rating/uReviews.length;
    update={overallRating: rating, reviews: uReviews};
    const info = await postCollection.updateOne({_id: ObjectId(postID)}, {$set: update});
    if(info.modifiedCount==0){
        throw "post did not update";
    }
    return newReview["_id"];
}

async function createComment(postID, username, comment){//returns whole comment object with its id as an objectId
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
    const newComment = {username: username, comment: comment, _id: new ObjectId()};
    const postCollection = await posts();
    const original = await getPostById(postID);
    const comments=original['comments'];
    let update = {};
    if(comments===[]){
        update['comments']=[newComment];
    }
    else{
        update['comments'] = comments;
        update['comments'].push(newComment)
    }
    const info = await postCollection.updateOne({_id: ObjectId(postID)}, {$set: update});
    if(info.modifiedCount==0){
        throw "post did not update";
    }
    return newComment["_id"];
}

async function getAllPosts(){ //returns all posts
  const postCollection = await posts();
  const postList = await postCollection.find({}).toArray();
  if (!postList) throw 'Error: Could not get all posts';

  for (const post of postList){ //turn to strings for use in getPostById
    post["_id"] = post["_id"].toString();
  }
  return postList;
}

//This function is to get, starting from an index, numberPosts posts, with the most recent ones being first, from array postList
async function getPostsByIndex(startingIndex, numberPosts, postList){
    if (typeof startingIndex === 'undefined') throw "Error: No startingIndex";
    if (typeof startingIndex !== 'number') throw "Error: startingIndex must be a number.";
    if (startingIndex < 0) throw "Error: Cannot have a negative startingIndex";
    if (typeof numberPosts === 'undefined') throw "Error: No numberPosts";
    if (typeof numberPosts !== 'number') throw "Error: numberPosts must be a number.";
    if (numberPosts < 0) throw "Error: Cannot have a negative numberPosts";
    if (startingIndex > postList.length -1) throw "Error: Index cannot exceed length of all posts";
    if (startingIndex + numberPosts > postList.length) throw "Error: Posts exceeded the number of total posts";

    dateArr = [];
    for (let post of postList){ //add objects with associated objectId's then change helper to do correct function, then use getpostbyid to get all of them
        let date = post['date']; //  12/16/2022
        let theDate = date.split("/");

        let time = post['time'];
        let day = theDate[0] + " " + theDate[1] + " " + theDate[2] + " " + time;
        let dDay = new Date(day);
        dateArr.push({date: dDay, id: post['_id']});
    }

    dateArr.sort(helpers.compareNumbers); //All dates are now sorted with the most recent as 0
    answer = [];
    for (let i = startingIndex; i < numberPosts; i++){
        let currentPost = await getPostById(dateArr[i]['id']);
        answer.push(currentPost);

    }
    return answer;
}

async function filterPosts(keywordArr, postList){ //returns postList, filter with the given keywordArr
    if (!keywordArr) throw "Error: No keywordArr given";
    if (!Array.isArray(keywordArr)) throw "Error: given input is not an array.";

    for (let keyword of keywordArr){
        if (typeof keyword !== 'string') throw "Error: An element of the array is not a string."
        if (keyword.trim().length === 0){
            throw "Error: Keyword in the given array is either an empty string or only whitespace."
        }
    }

    answer = [];
    for (let post of postList){
        postKeywords = post['keywords'];
        contained = true;
        let i = 0;
        while (i < keywordArr.length){
            if (!postKeywords.includes(keywordArr[i])) {
                contained = false
                break;
            }
        }
        if (contained) answer.push(post);
    }

    return answer;
}

async function getPostsByKeywords(keywords){
    if(typeof keywords!='string'){
        throw "keywords needs to be a string";
    }
    keywords.trim();
    if(keywords!=''){
        throw "keywords cannot be white space";
    }
    
    //making list of keywords
    let filter={};
    let space;
    while(keywords!=''){
        space=keywords.indexOf(' ');
        if(space!=-1){
            filter.push(keywords.substring(space));
            keywords=keywords.substring(space+1);
        }
    }
    filter.push(keywords);
    
    let posts = await this.getAllPosts();
    let filtered={};
    let found = true;
    for(let i=0; i<posts.length; i++){
        for(let j=0; j<filter.length; j++){
            if(!posts[i]['keywords'].includes(filters[j])){
                found=false;
            }
        }
        if(found){
            filtered.push(post[i]);
        }
    }
    return filtered;
} 

module.exports = {
    createPost,
    createReview,
    getAllPosts,
    getPostById,
    filterPosts,
    getPostsByIndex,
    createComment,
    getPostsByKeywords
};