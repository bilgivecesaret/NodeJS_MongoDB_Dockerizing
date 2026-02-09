var express = require('express');

const bcrypt = require('bcrypt-nodejs');
const is = require('is_js');
const jwt = require('jwt-simple');

const Users = require('../db/models/Users');
const Roles = require('../db/models/Roles');
const UserRoles = require('../db/models/UserRoles');
const RolePrivileges = require('../db/models/RolePrivileges');
const { priviliges } = require('../config/role_privileges');

const Responce = require('../lib/Responce');
const CustomError = require('../lib/Error');
const Enum = require('../config/Enum');
const config = require('../config');
var router = express.Router();
const auth = require('../lib/auth')();

/* Register user. */
router.post('/register', async (req, res) => {
  let body = req.body;
  try {
      let user  = await Users.findOne({});

      if(user){
        return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND);
      }

      if(!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Email is required");
      if(is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Email is not valid format");

      if(!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Password is required");
      if(body.password.length < Enum.PASS_LENGTH){
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Password must be at least " + Enum.PASS_LENGTH + " characters long");
      } 

      let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
      

      let createdUser = await Users.create({
        email: body.email,
        password,
        is_active: true,
        first_name: body.first_name,
        last_name: body.last_name,
        phone_number: body.phone_number
      });
    
      let role = await Roles.create({
        role_name: Enum.SUPER_ADMIN,
        is_active: true,
        created_by: createdUser._id
      });

      let rolePrivileges = priviliges.map(p => ({
        role_id: role._id,
        permission: p.key
      }));

      await RolePrivileges.insertMany(rolePrivileges);

      await UserRoles.create({
        role_id: role._id,
        user_id: createdUser._id,
      });
      
      res.status(Enum.HTTP_CODES.CREATED).json(Responce.successResponce({success: true}, Enum.HTTP_CODES.CREATED));

  } catch (error) {
      let errorResponce = Responce.errorResponce(error);
      res.status(errorResponce.code).json(errorResponce);
  }
});

router.post('/auth', async (req, res) => {
  try {

    let {email, password} = req.body;

    Users.validateFieldsBeforeAuth(email, password);

    let user = await Users.findOne({email});
    
    if(!user) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Authentication Error", "Email or Password are incorrect");

    if(!user.validatePassword(password)) throw new CustomError(Enum.HTTP_CODES.UNAUTHORIZED, "Authentication Error", "Email or Password are incorrect");

    let payload = {
      id: user._id,
      exp: parseInt(Date.now() / 1000) + config.JWT.EXPIRATION_TIME
    };

    let token = jwt.encode(payload, config.JWT.SECRET);

    let userData = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    res.json(Responce.successResponce({token, user: userData}));

  } catch (error) {
    let errorResponce = Responce.errorResponce(error);
    res.status(errorResponce.code).json(errorResponce);
  }

});

router.all('*',auth.authenticate(), (req, res, next) => {
  next();
});
/* GET users listing. */
router.get('/', auth.checkRoles('user_view'), async (req, res) => {
  try {
    let users = await Users.find({});
    res.json(Responce.successResponce(users));
  } catch (error) {
    let errorResponce = Responce.errorResponce(error);
    res.status(errorResponce.code).json(errorResponce);
  }
});

/* POST create user. */
router.post('/add', auth.checkRoles('user_add'), async (req, res) => {
  let body = req.body;
  try {
      if(!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Email is required");
      if(is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Email is not valid format");

      if(!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Password is required");
      if(body.password.length < Enum.PASS_LENGTH){
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Password must be at least " + Enum.PASS_LENGTH + " characters long");
      } 

      if(!body.roles || !Array.isArray(body.roles) || body.roles.length == 0){
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Roles are required");
      }

      let roles = await Roles.find({_id: {$in: body.roles}});
      if(roles.length == 0){
        throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Roles are not valid");
      }

      let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

      let user = await Users.create({
        email: body.email,
        password,
        is_active: true,
        first_name: body.first_name,
        last_name: body.last_name,
        phone_number: body.phone_number
      });

      for(let i=0; i<body.roles.length; i++){
        await UserRoles.create({
          role_id: roles[i]._id,
          user_id: user._id,
        });
      }


      res.status(Enum.HTTP_CODES.CREATED).json(Responce.successResponce({success: true}, Enum.HTTP_CODES.CREATED));
  } catch (error) {
      let errorResponce = Responce.errorResponce(error);
      res.status(errorResponce.code).json(errorResponce);
  }
});


/* UPDATE user. */
router.post('/update', auth.checkRoles('user_update'), async (req, res) => {
  let body = req.body;
  try {
    let updates = {};
    
    if(!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "User id is required");
    
    if(body.password && body.password.length < Enum.PASS_LENGTH){
      throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Password must be at least " + Enum.PASS_LENGTH + " characters long");
    } else if(body.password){
      updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
    }

    if(typeof body.is_active === "boolean") updates.is_active = body.is_active;
    if(body.first_name) updates.first_name = body.first_name;
    if(body.last_name) updates.last_name = body.last_name;
    if(body.phone_number) updates.phone_number = body.phone_number;


    if(Array.isArray(body.roles) && body.roles.length == 0){
      let userRoles = await UserRoles.find({user_id: body._id});
      let removeRoles = userRoles.filter(r => !body.roles.includes(r.role_id));
      let newRoles = body.roles.filter(r => !userRoles.map(r => r.role_id).includes(r));

      if(removeRoles.length > 0){
        await UserRoles.deleteMany({_id: {$in: removeRoles.map(r => r._id)}});
      }

      if(newRoles.length > 0){
        for(let i=0; i<newRoles.length; i++){
          let userRole = UserRoles.create({
            role_id: newRoles[i],
            user_id: body._id,
          });
          await userRole.save();
        }
      }
    }

    await Users.updateOne({_id: body._id}, updates);
    res.json(Responce.successResponce({success: true}));
  } catch (error) {
      let errorResponce = Responce.errorResponce(error);
      res.status(errorResponce.code).json(errorResponce);
  }
});

router.post('/delete', auth.checkRoles('user_delete'), async (req, res) => {
  let body = req.body;
  try {
    if(!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "User id is required");
    await Users.deleteOne({_id: body._id});
    await UserRoles.deleteMany({user_id: body._id});
    res.json(Responce.successResponce({success: true}));
  } catch (error) {
      let errorResponce = Responce.errorResponce(error);
      res.status(errorResponce.code).json(errorResponce);
  }
});

module.exports = router;
