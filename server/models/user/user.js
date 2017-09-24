import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';
import bcrypt from 'bcrypt';
import {readConfigPath} from "../../utils/config-reader";
import {userCount} from "../../services/notes/user-service"
import jwt from 'jsonwebtoken';

const salt = readConfigPath('credential.hashing.salt');

const generatePasswordHash = password =>{
  return bcrypt.hashSync(password, salt);
};

const schema = new Schema({
  username:{
    type: String,
    validate: {
      validator(value, cb) {
        if(!value){
          cb(false, 'This is required field.');
        }

        if(value.trim().indexOf(' ') > -1){
          cb(false, 'The username is invalid.');
        }

        userCount()
          .then(count => {
            cb(count === 0, 'There should be only one user.');
          })
          .catch(function () {
            cb(false, 'There is an error during the validation process.');
          })
      }
    }
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator(value, cb){
        const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        cb(emailRegex.test(value), 'Email is not in the correct format.');
      }
    }
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  token: {
    type: String
  }
});

class CategorySchema {
  static async checkPassword(username, password) {
    try {
      const user = await this.findOne({username: username}).select({username: 1, _id: 1, password: 1});
      if(!user){
        return false;
      }
      const isAuthenticated = bcrypt.compareSync(password, user.password);
      const jwtTokenSecret = readConfigPath('credential.token');
      if(!isAuthenticated || !jwtTokenSecret){
        return false;
      }

      const token = jwt.sign(user.toObject(), jwtTokenSecret,{
        expiresIn: 60*60*24
      });

      await this.update({username: username}, {token: token});
      return token;
    } catch (err) {
      return false;
    }
  }

  static async logout(){
    try {
      await this.update({token: ''});
      return true;
    } catch (error){
      return false;
    }
  }

  static async changePassword(userId, password, oldPassword) {
    try {
      let user = await this.findById(userId).select({username: 1, _id: 1, password: 1});
      if(!user){
        return false;
      }

      const isAuthenticated = bcrypt.compareSync(oldPassword, user.password);
      const jwtTokenSecret = readConfigPath('credential.token');
      if(!isAuthenticated || !jwtTokenSecret){
        return false;
      }

      user = await this.findByIdAndUpdate(user._id, { password:  generatePasswordHash(password)});

      const token = jwt.sign(user.toObject(), jwtTokenSecret,{
        expiresIn: 60*60*24
      });

      await this.findByIdAndUpdate(user._id, { token:  token });

      return token;
    } catch (err) {
      return false;
    }
  }
}

schema.loadClass(CategorySchema);
schema.plugin(timestamps);

schema.pre('save', function(next) {
  this.password = generatePasswordHash(this.password);
  next();
});

export default mongoose.model('User', schema);