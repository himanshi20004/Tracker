const express = require('express')
const cors = require('cors')
const app = express()
const cookieParser = require('cookie-parser');
const path=require('path')

const errorMiddleware = require('./middleware/error')
app.use(cors({
    origin: '*', // React frontend URL
    credentials: true, // if you need to handle cookies or other credentials
}));
app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static('uploads'));
//routes import

const task = require("./routes/taskRoutes")
const user= require("./routes/userRoutes")
const quiz=require("./routes/quizRoutes")
const chat=require("./routes/chatRoutes")
const messages=require("./routes/messageRoute")
const doubt=require("./routes/doubtRoutes")
//const notes=require("./routes/notesRoute")
app.use("/api/v1",task)
app.use("/api/v1",user)
app.use("/api/v1",quiz)
app.use("/api/v1",chat)
app.use("/api/v1",messages)
app.use("/api/v1",doubt)
//app.use("/api/v1",notes)

//middleware for errors
app.use(errorMiddleware)

module.exports = app