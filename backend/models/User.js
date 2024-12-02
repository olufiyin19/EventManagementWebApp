const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
  name: String,
  email: {type:String, unique:true},
  password: String,
  image: { type: String, default: '' } // Field for profile photo
})

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;