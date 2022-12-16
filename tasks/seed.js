const dbConnection = require('../config/mongoConnections');
const data = require('../data/');
const users = data.users
const posts = data.posts


async function main() {
    const db = await dbConnection.connectToDb()
    await db.dropDatabase();
    //create users and their posts
    //user one
    await users.createUser('Andrew', 'Capro', 'acapro@gmail.com', 'acapro', 'andrew123')
    const aPost1 = await posts.createPost('Andrew', 'Capro', 'an object', 'image.png', '3 Cool Ln.')
    await posts.createPost('Andrew', 'Capro', 'an object 2', 'image2.png', '400 West St.')
    const aPostID = aPost1._id.toString()

    //user two
    await users.createUser('Nick', 'Mule', 'nmule@gmail.com', 'nmule', 'nick123')
    const nPost = await posts.createPost('Nick', 'Mule', 'an object 3', 'image3.png', '800 Washington St.')
    const nPostID = nPost._id.toString()
    await posts.createReview(aPostID, 'nmule', 'This is a cool thing!', 5)
    await posts.createComment(aPostID, 'nmule', 'Its actually hidden under the stairs')

    //user three
    await users.createUser('Casey', 'Mulrooney', 'cmulrooney@gmail.com', 'cmulrooney', 'casey123')
    const cPost1 = await posts.createPost('Casey', 'Mulrooney', 'an object 4', 'image4.png', '300 Bloomfield Ave.')
    await posts.createPost('Casey', 'Mulrooney', 'an object 5', 'image5.png', 'Outside Babbio Center')
    const cPostID = cPost1._id.toString()
    await posts.createReview(nPostID, 'cmulrooney', 'This is fake!', 4)
    await posts.createComment(aPostID, 'cmulrooney', 'nmule is wrong, someone already took it!')

    //user four
    await users.createUser('Chancelor', 'Assiamah', 'cassiamah@gmail.com', 'cassiamah', 'chancelor123')
    const chPost = await posts.createPost('Chancelor', 'Assiamah', 'an object 6', 'image6.png', '800 Washington St.')
    await posts.createReview(cPostID, 'cassiamah', 'It was exactly where the picture depicted!', 3)
    await posts.createComment(nPostID, 'cassiamah', 'no where to be found')

    console.log('Done seeding')
    
    await dbConnection.closeConnection();
}

main();