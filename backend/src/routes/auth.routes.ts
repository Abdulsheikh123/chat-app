import express from 'express';
import { getProfileController, loginController, logoutController, registerController, refreshController, getAllUsersController } from '../controllers/auth.controller.js';
import { protectAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginValidation, registerValidation } from "../validations/validation.js";
import { uploadProfile } from '../middlewares/upload.middleware.js';



const route = express.Router();


route.get('/me', protectAuth,  getProfileController);
route.get('/users', protectAuth, getAllUsersController);
route.post('/register', uploadProfile.single('profileImage'), validate(registerValidation), registerController);
route.post('/login', validate(loginValidation), loginController);
route.post("/refresh", refreshController);
route.post('/logout', logoutController)


export default route;
