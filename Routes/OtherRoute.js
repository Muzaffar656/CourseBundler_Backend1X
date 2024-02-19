import express from "express";
import { authorizedAdmin, isAuthenticated } from "../Middelware/auth.js";
import { contact, courseRequest ,getDashboardStats} from "../Controller/OtherController.js";
const router = express.Router()

router.route('/contact').post(contact)
router.route('/courserequest').post(courseRequest)


// get admin state

router.route('/admin/stats').get(isAuthenticated,authorizedAdmin,getDashboardStats)
export default router