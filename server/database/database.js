const {connect} = require('mongoose')

const connectToDb = async(url) => {
    await connect(url);
}
module.exports = connectToDb;