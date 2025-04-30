const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const UserRouter = require('./Routes/User.Route');
const VideoRouter = require('./Routes/video.Route');
const commentRouter=require('./Routes/comment.Route');
const bodyParser=require('body-parser');
const FileUpload=require('express-fileupload');
//Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); 
app.use(FileUpload({
    useTempFiles : true,
    // tempFileDir : '/tmp/'
}));


app.get('/', (req, res) => {
    res.send('Hello World!');
});

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB...'))
.catch(err => console.error('Could not connect to MongoDB...', err));

app.use('/user', UserRouter);
app.use('/video', VideoRouter);
app.use('/comment',commentRouter);

module.exports = app;