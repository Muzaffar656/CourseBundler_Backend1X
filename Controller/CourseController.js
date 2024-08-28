import { catchAsyncError } from '../Middelware/catchAsyncError.js'
import {Course} from '../Model/Course.js'
import { Stats } from '../Model/Stats.js'
import getDataUri from '../Utils/dataUri.js'
import ErrorHandler from '../Utils/errorHandler.js'
import cloudinary from 'cloudinary'



export  const getAllCourses = catchAsyncError( async(req,res,next)=>{
   

    const keyword = req.query.keyword || ""
    const category = req.query.category || ""

    // categories whise
    const course = await Course.find({
        title:{
            $regex:keyword ,
            $options:"i"
        },
        category:{
            $regex:category,
            $options:"i"
        }
    }).select('-lectures')

    res.json({
        success : true,
        course
    })
})

export  const  createCourse = catchAsyncError( async(req,res,next)=>{
   
   const {title,description,category,createdBy} = req.body

    if(!title || !description || !category || !createdBy) return next(new ErrorHandler('Please add all fields',400))

    const file = req.file;
  const fileUri =  getDataUri(file)

const mycloud = await cloudinary.v2.uploader.upload(fileUri.content)
   await Course.create({
    title,
    description,
    category,
    createdBy,
    poster:{
        public_id:mycloud.public_id,
        url:mycloud.secure_url
    }
   })
    res.status(201).json({
        success : true,
        message:"Course Created Successfully. You can add lecture Now"
    })
})


export const getCourseLecture = catchAsyncError(async(req,res,next)=>{
    
    const course = await Course.findById(req.params.id)

    if(!course) return next(new ErrorHandler("Course not found",404))
    
    course.views += 1

    await course.save()

    res.status(200).json({
        success : true,
        lectures : course.lectures
    })
})

export const addLecture = catchAsyncError(async(req,res,next)=>{
    
    const {id} = req.params

    const {title,description} = req.body

    const course = await Course.findById(req.params.id)

    if(!course) return next(new ErrorHandler("Course not found",404))

    const file = req.file
    const fileUri = getDataUri(file)
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content,{
        resource_type:"video"
    })

    course.lectures.push({
        title,
        description,
        video:{
            public_id: mycloud.public_id,
            url:mycloud.secure_url
        }
    })

    course.numOfVideos = course.lectures.length

    await course.save()

    res.status(200).json({
        success : true,
        message:"Lecture Added in Course"
    })
})

export const DeleteCourse = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;
     
    const course = await Course.findById(id)

    if(!course) return next(new ErrorHandler("Course Not Found",404))
       
    await cloudinary.v2.uploader.destroy(course.poster.public_id)

    for (let i = 0; i < course.lectures.length; i++) {
        const singleLecture = course.lectures[i];

        await cloudinary.v2.uploader.destroy(singleLecture.video.public_id,{
            resource_type:"video"
        })
    }

    await course.deleteOne()

    res.status(200).json({
        success : true,
      message : "Course deleted successfully"
})

})

export const DeleteLecture = catchAsyncError(async (req,res,next)=>{
    const {courseId,lectureId} = req.query;

    const course = await Course.findById(courseId)

    if(!course) return next(new ErrorHandler("Lecture not found",404))

    const lecture = course.lectures.find((item)=>{
        if(item._id.toString() === lectureId.toString() ) return item
    })
        await cloudinary.v2.uploader.destroy(lecture.video.public_id,{
            resource_type:"video"
        })
    course.lectures = course.lectures.filter((item)=>{
        if(item._id.toString() !== lectureId.toString()) return item;
    })
course.numOfVideos = course.lectures.length
await course.save()
res.status(200).json({
    success:true,
    message:"Lecture deleted successfully"
})
})
// .select 
// when you to send the specific property of user then use select and the name



Course.watch().on('change',async()=>{
    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1)
    const course = await Course.find({})

   let totalView = 0

    for (let i = 0; i < course.length; i++) {
        totalView += course[i].views
        
    }

    stats[0].views = totalView
    stats[0].createdAt = new Date(Date.now())
    await stats[0].save()
})