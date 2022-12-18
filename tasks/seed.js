const dbConnection = require('../config/mongoConnections');
const data = require('../data/');
const users = data.users
const posts = data.posts


async function main() {
    const db = await dbConnection.connectToDb()
    await db.dropDatabase();
    //create users and their posts
    //user one
    const andrew1 = await users.createUser('Andrew', 'Capro', 'acapro@gmail.com', 'acapro', 'Andrew123!', 22, "732-555-2234") //create returns whole user object with id as a string

    const aPost1 = await users.makePost(andrew1['_id'], 'acapro', 'Dumbbells and Backpack', "../public/photos/img.png", '3 Cool Ln.', 'Dumbbells; and; Backpack') //make creates the post, and adds it to user as well, returns postId
    await users.makePost(andrew1['_id'], 'acapro', 'Potted Plant', '../public/photos/img2.jpg', '400 West St.', 'Potted; Plant')
    const aPostID = aPost1

    //user two
    const nick1 = await users.createUser('Nick', 'Mule', 'nmule@gmail.com', 'nmule', 'Nick123!', 21, "732-225-1134") //whole user as an object
    await users.makeAdmin(nick1['_id'])
    const nPost = await users.makePost(nick1['_id'], 'nmule', 'Couch', '../public/photos/img3.jpg', '800 Washington St.', 'Couch') //returns postId
    const nPostID = nPost
    //console.log(nick1['_id'])
    await users.makeReview(nick1['_id'], aPostID, 'nmule', 'This is a cool thing!', 5) 
    await users.makeComment(nick1['_id'], aPostID, 'nmule', 'Its actually hidden under the stairs')

    //user three
    const casey1 = await users.createUser('Casey', 'Mulrooney', 'cmulrooney@gmail.com', 'cmulrooney', 'Casey123!', 21, "732-625-2184")
    const cPost1 = await users.makePost(casey1['_id'], 'cmulrooney', 'Mulch', '../public/photos/img4.jpg', '300 Bloomfield Ave.', 'Mulch')
    await users.makePost(casey1['_id'], 'cmulrooney', 'White Chairs', '../public/photos/img5.jpg', 'Outside Babbio Center', 'White; Chairs')
    const cPostID = cPost1.toString()
    await users.makeReview(casey1['_id'], aPostID, 'cmulrooney', 'Im not a fan', 2) 
    await users.makeReview(casey1['_id'], nPostID, 'cmulrooney', 'This is fake!', 4)
    await users.makeComment(casey1['_id'], aPostID, 'cmulrooney', 'nmule is wrong, someone already took it!')

    //user four
    const chance1 = await users.createUser('Chancelor', 'Assiamah', 'cassiamah@gmail.com', 'cassiamah', 'Chancelor123!', 22, "732-362-2847")
    const chPost = await users.makePost(chance1['_id'], 'cassiamah', 'Kids Bike', '../public/photos/img6.jpg', '800 Washington St.', 'Kids; Bike')
    await users.makeReview(chance1['_id'], cPostID, 'cassiamah', 'It was exactly where the picture depicted!', 3)
    await users.makeComment(chance1['_id'], nPostID, 'cassiamah', 'no where to be found')

    console.log('Done seeding')
    
    await dbConnection.closeConnection();
}

main();