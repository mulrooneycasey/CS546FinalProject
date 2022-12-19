const mongoCollections = require('../config/mongoCollections');
const posts = mongoCollections.posts;
const users = mongoCollections.users;
const {ObjectId} = require('mongodb');
const bcrypt = require('bcrypt');
const helpers = require('../helpers');

async function createPost(username, object, image, location, keywords, placed){ //returns postId
    if(!username || !object || !image || !location || !keywords || typeof placed === "undefined"){
        throw "missing item";
    }
    if(typeof username!='string' || typeof location!='string' || typeof object!='string' || typeof placed !== "boolean"){
        throw "username, location, and object has to be a string";
    }
    if(typeof keywords != ' undefined' && typeof keywords != 'string'){
        throw "keywords has to be a string";
    }
    username.trim();
    location.trim();
    object.trim();
    keywords.trim();
    if(username=='' || location=='' || object==''){
        throw "first name, last name, location, and object has to be a string";
    }

    //not sure how to do images with mongodb

    const postCollection = await posts();
    const d = new Date();
    const date = (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear();
    time=d.toTimeString();
    let newPost = {username: username, description: object, image: image, placed: placed,
        location: location, time: time, date: date, overallRating: 5, reviews: [], comments: [], status: "pending", keywords: keywords.split("; "), favorites: 0};
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

async function createReview(postID, username, comment, rating){ //returns review id as a string
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
    return newReview["_id"].toString();
}

async function createComment(postID, username, comment){//returns comment object id as a string
    if(!postID || !username || !comment){
        throw "missing info for comment";
    }
    if(typeof postID!='string' || typeof username!='string' || 
    typeof comment!='string'){
        throw "type of info is wrong for comment";
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
    return newComment["_id"].toString();
}

async function getAllPosts(){ //returns all posts with ids as a string
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
    if (postList.length < 0 && startingIndex > postList.length -1) throw "Error: Index cannot exceed length of all posts";

    let dateArr = [];
    for (let post of postList){ //add objects with associated objectId's then change helper to do correct function, then use getpostbyid to get all of them
        let date = post['date']; //  12/16/2022
        let theDate = date.split("/");

        let time = post['time'];
        let day = theDate[0] + " " + theDate[1] + " " + theDate[2] + " " + time;
        let dDay = new Date(day);
        dateArr.push({date: dDay, id: post['_id']});
    }

    dateArr.sort(helpers.compareNumbers); //All dates are now sorted with the most recent as 0
    let answer = [];
    let maxLength = 0;
    if (numberPosts >= postList.length) maxLength = postList.length;
    else maxLength = numberPosts
    for (let i = startingIndex; i < maxLength; i++){
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
        if (helpers.containsSpace(keyword)) throw "Error: A keyword cannot have a space.";
    }
    //Should be: go through postlist, and check each word of keywordArr. If there is not a match in the post's keywords, break and contained == false so no add
    answer = []; //FIX THIS TO NOT WORK IF COUCH AND WHITE
    let contained = true;
    for (let post of postList){ //for each post
        postKeywords = post['keywords']; //get all post keywords as an array
        contained = true; //set contained to true
        for (let givenKeyword of keywordArr){ //take each keyword of the given keywordArr
            if (!postKeywords.includes(givenKeyword)) { //if the post's keywords does not include the current keyword, false and break
                contained = false;
                break;
            }
        }
        if (contained) answer.push(post);
    }
    return answer;
}

//returns all the posts that has keywords
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
                break;
            }
        }
        if(found){
            filtered.push(post[i]);
        }
    }
    return filtered;
} 

async function searchPosts(searchField, postList){
    if (!searchField) throw "Error: No searchField given";
    if (typeof searchField !== "string") throw "Error: given input is not a string.";
    searchField = searchField.trim();
    if (searchField.length === 0) throw "Error searchField cannot be only whitespace.";

    answer = [];
    for (let post of postList){
        let postKeywords = post['keywords'];
        let postTitle = post['description'];
        let containedInKeyword = false;
        let i = 0;
        let regEx1 = new RegExp(searchField.toLowerCase());
        while (i < postKeywords.length){
            if (regEx1.test(postKeywords[i].toLowerCase())) {
                containedInKeyword = true;
                break;
            }
            i++;
        }
        if (regEx1.test(postTitle.toLowerCase()) || containedInKeyword) answer.push(post)
    }
    return answer;
}


async function deletePost(postID){//deletes post
    if(!postID){
        throw "need postID";
    }
    if(typeof postID!='string'){
        throw "postID needs to be a string";
    }
    postID.trim();
    if(postID==='' || !ObjectId.isValid(postID)){
        throw "postID is not a valid";
    }
    const postCollection = await posts();
    const postExists = await this.getPostById(postID);
    const del = await postCollection.deleteOne({_id: ObjectId(postID)});
    if(del.deletedCount==0){
        throw "Error: did not delete post id";
    }
    return {deleted: true};
}

async function postApproval(postID, isAdmin, approval){//changes status of post and if denied deletes it
    if(!postID || !isAdmin || !approval){
        throw "missing info for approval";
    }
    if(typeof postID!='string' || typeof isAdmin!='boolean' || 
    typeof approval!='string'){
        throw "type of info is wrong for approval";
    }
    postID.trim();
    approval.trim();
    if(postID=='' || approval==''){
        throw "postid or approval is empty";
    }
    if(!ObjectId.isValid(postID)){
        throw "not valid post id";
    }
    if(!isAdmin){
        throw "Error: need admin status to approve or deny posts"
    }
    if(approval!=='approve' || approval !=='deny'){
        throw "Error: need to approve or deny";
    }
    const postCollection = await posts();
    if(approval===true){
        const update = {status: 'approved'};
        const info =postCollection.updateOne({_id: ObjectId(postID)}, {$set: update});
        if(info.modifiedCount==0){
            throw "Error: name did not update";
        }
        return await this.getPostById(postID);
    }
    else{
        this.deletePost(postID);
        return "post was deleted";
    }
}

async function favoritePost(postID){//adds favorite number on a post, returns post
    if(!postID){
        throw "need postID";
    }
    if(typeof postID!='string'){
        throw "postID needs to be a string";
    }
    postID.trim();
    if(postID==='' || !ObjectId.isValid(postID)){
        throw "postID is not a valid";
    }
    let postCollection= await posts()
    let post = await this.getPostById(postID);
    const favorites = post['favorite'] + 1;
    const update = {favorite: favorites};
    const info= await postCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: name did not update";
    }
    return await this.getPostById(id);
}

async function removeFavorite(postID){//removes favorite from a post, returns post
    if(!postID){
        throw "need postID";
    }
    if(typeof postID!='string'){
        throw "postID needs to be a string";
    }
    postID.trim();
    if(postID==='' || !ObjectId.isValid(postID)){
        throw "postID is not a valid";
    }
    let postCollection= await posts()
    let post = await this.getPostById(postID);
    const favorites = post['favorite'] - 1;
    const update = {favorite: favorites};
    const info= await postCollection.updateOne({_id: ObjectId(id)}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: name did not update";
    }
    return await this.getPostById(id);
}

async function getAllPostsByUser(userId){
    if (!userId) throw "Error: Must supply userId";
    if (typeof userId != 'string') throw "Error: userId must be a string";
    userId = userId.trim();
    if (userId.length === 0) throw "Error: userId cannot be only whitespace";
    if (!ObjectId.isValid(userId)) throw "Error: userId is not a valid objectId";
    const postList = await getAllPosts();
    if (!postList) throw 'Error: Could not get all posts';
    for (const post of postList){ //turn to strings for use in getPostById
        post["_id"] = post["_id"].toString();
    }
    let user = async () =>{//you might be wondering why I did this and why I did not just get the actual function from userData
        if(!userId){  //CIRCULAR LOGIC ISNT ALLOWED IS WHY AHHHHHHHH
            throw "Error: no userId provided";
        }
        if(typeof userId!='string' || userId.trim()==''){
            throw "Error: userId is not a valid string";
        }
        userId=userId.trim();
        if(!ObjectId.isValid(userId)){
            throw "Error: userId is not valid";
        }
        const userCollection = await users();
        let user= await userCollection.findOne({_id: ObjectId(userId)});
        if(user==null){
            throw "no post with that id";
        }
        user['_id']=user['_id'].toString();
        return user;
    }
    let tUser = await user();
    let answer = [];
    console.log(tUser.posts.toString());
    for (let i = 0; i < tUser.posts.length; i++){
        tUser.posts[i] = tUser.posts[i].toString();
    }
    for (const post of postList){
        if (tUser.posts.includes(post._id)) answer.push(post);
    }
    return answer;
}

async function updatePostsByUser(userId, newUsername){
    if (!userId) throw "Error: Must supply userId";
    if (typeof userId != 'string') throw "Error: userId must be a string";
    userId = userId.trim();
    if (userId.length === 0) throw "Error: userId cannot be only whitespace";
    if (!ObjectId.isValid(userId)) throw "Error: userId is not a valid objectId";
    if(!newUsername){
        throw "Error: need new username";
    }
    if(typeof newUsername != 'string'){
        throw "Error: username needs to be a string";
    }
    newUsername.trim();
    if(newUsername==''){
        throw "Error: username cannot be only white space";
    }
    let posts = await this.getAllPostsByUser(userID);
    let currPost;
    let update;
    let info;
    while(posts.length>0){
        currPost=posts.pop();
        update={username: newUsername};
        info = await postCollection.updateOne({_id: currPost['_id']}, {$set: update});
        if(info.modifiedCount==0){
            throw "Error: was not able to modify all the posts";
        }
    }
    return;
}

async function itemTaken(postID, username, isAdmin){
    if(!postID || !username || !isAdmin){
        throw "need postid username and isAdmin";
    }
    if(typeof postID!='string' || typeof userID!='string' || typeof isAdmin!='boolean'){
        throw "postid and username needs to be a string and isAdmin needs to be boolean";
    }
    postID.trim();
    username.trim();
    if(postID=='' || !ObjectId.isValid(postID) || username==''){
        throw "postid/username are not valid";
    }
    let post = await this.getPostById(postID);
    if(!isAdmin){
        if(post['username']!==username){
            throw "Error: user does not have access to this post";
        }
    }
    let update = {status: 'taken'};
    let info = await postCollection.updateOne({_id: currPost['_id']}, {$set: update});
    if(info.modifiedCount==0){
        throw "Error: was not able to modify the post";
    }
    return await this.getPostById;
}

module.exports = {
    createPost,
    createReview,
    getAllPosts,
    getPostById,
    filterPosts,
    getPostsByIndex,
    createComment,
    searchPosts,
    getPostsByKeywords,
    deletePost,
    postApproval,
    favoritePost,
    removeFavorite,
    getAllPostsByUser,
    updatePostsByUser,
    itemTaken
};