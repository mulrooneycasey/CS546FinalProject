const dbConnection = require('../config/mongoConnections');
const data = require('../data/');
const users = data.users
const posts = data.posts


async function main() {
    const db = await dbConnection.connectToDb()
    await db.dropDatabase();
    //create users and their posts
    //user one
    const andrew1 = await users.createUser('Andrew', 'Capro', 'acapro@gmail.com', 'acapro', 'Andrew123!') //create returns whole user object with id as a string
    const aPost1 = await users.makePost(andrew1['_id'], 'Andrew', 'Capro', 'an object', 'image.png', '3 Cool Ln.') //make creates the post, and adds it to user as well, returns postId
    await users.makePost(andrew1['_id'], 'Andrew', 'Capro', 'an object 2', 'image2.png', '400 West St.')
    const aPostID = aPost1

    //user two
    const nick1 = await users.createUser('Nick', 'Mule', 'nmule@gmail.com', 'nmule', 'Nick123!') //whole user as an object
    const nPost = await users.makePost(nick1['_id'], 'Nick', 'Mule', 'an object 3', 'image3.png', '800 Washington St.') //returns postId
    const nPostID = nPost
    //console.log(nick1['_id'])
    await users.makeReview(nick1['_id'], aPostID, 'nmule', 'This is a cool thing!', 5) 
    await users.makeComment(nick1['_id'], aPostID, 'nmule', 'Its actually hidden under the stairs')

    //user three
    const casey1 = await users.createUser('Casey', 'Mulrooney', 'cmulrooney@gmail.com', 'cmulrooney', 'Casey123!')
    const cPost1 = await users.makePost(casey1['_id'], 'Casey', 'Mulrooney', 'an object 4', 'image4.png', '300 Bloomfield Ave.')
    await users.makePost(casey1['_id'], 'Casey', 'Mulrooney', 'an object 5', 'image5.png', 'Outside Babbio Center')
    const cPostID = cPost1.toString()
    await users.makeReview(casey1['_id'], nPostID, 'cmulrooney', 'This is fake!', 4)
    await users.makeComment(casey1['_id'], aPostID, 'cmulrooney', 'nmule is wrong, someone already took it!')

    //user four
    const chance1 = await users.createUser('Chancelor', 'Assiamah', 'cassiamah@gmail.com', 'cassiamah', 'Chancelor123!')
    const chPost = await users.makePost(chance1['_id'], 'Chancelor', 'Assiamah', 'an object 6', 'image6.png', '800 Washington St.')
    await users.makeReview(chance1['_id'], cPostID, 'cassiamah', 'It was exactly where the picture depicted!', 3)
    await users.makeComment(chance1['_id'], nPostID, 'cassiamah', 'no where to be found')

    console.log('Done seeding')
    
    await dbConnection.closeConnection();
}

main();