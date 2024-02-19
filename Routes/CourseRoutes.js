import express from 'express'
import  {getAllCourses,createCourse,getCourseLecture, addLecture, DeleteCourse, DeleteLecture}  from '../Controller/CourseController.js'
import singleUpload from '../Middelware/multer.js'
import { authorizedAdmin, isAuthenticated, authorizedSubscribers } from '../Middelware/auth.js'

const router = express.Router()

// get all course without lecture
router.route('/courses').get(getAllCourses)

// create course only admin
router.route('/createcourse').post(isAuthenticated,authorizedAdmin,singleUpload,createCourse)

router.route('/course/:id').get(isAuthenticated,authorizedSubscribers,getCourseLecture).post(isAuthenticated,authorizedAdmin,singleUpload,addLecture).delete(
    isAuthenticated,authorizedAdmin,DeleteCourse
)
router.route('/lecture').delete(isAuthenticated,authorizedAdmin,DeleteLecture)
export default router