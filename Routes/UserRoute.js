import {User} from '../Model/User.js'
import  express  from 'express'
import { ChangePassword, ForgetPassword, Login, Logout, Register, ResetPassword, UpdateProfile, UpdateProfilePicture, getMyProfile,addToPlayList, removefromToPlayList, getAllUsers, UpdateUserRole ,
    DeleteUser,
    DeleteMyProfile
} from '../Controller/UserController.js'
import { authorizedAdmin, isAuthenticated } from '../Middelware/auth.js'
import singleUpload from '../Middelware/multer.js'
const router  = express.Router()

router.route('/register').post(singleUpload,Register)
router.route('/login').post(Login)
router.route("/logout").get(Logout)
router.route("/me").get(isAuthenticated,getMyProfile)

router.route('/me').delete(isAuthenticated,DeleteMyProfile)

router.route('/changepassword').put(isAuthenticated,ChangePassword)
router.route('/updateprofile').put(isAuthenticated,UpdateProfile)
router.route('/updateprofilepicture').put(isAuthenticated,singleUpload,UpdateProfilePicture)
router.route('/forgetpassword').post(isAuthenticated,ForgetPassword)
router.route("/resetpassword/:token").put(isAuthenticated,ResetPassword)
router.route("/addtoplaylist").post(isAuthenticated,addToPlayList)
router.route("/removefromplaylist").delete(isAuthenticated,removefromToPlayList)


// admin routes

router.route('/admin/users').get(isAuthenticated,authorizedAdmin,getAllUsers)
router.route("/admin/user/:id").put(isAuthenticated,authorizedAdmin,UpdateUserRole).delete(isAuthenticated,authorizedAdmin,DeleteUser)
export default router

