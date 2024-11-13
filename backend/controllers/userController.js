const ErrorHander = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require("../models/usermodels");
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail.js');
const Resource = require('../models/resource.js');
const Quiz = require('../models/quizmodel'); 


// Register a user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { username, email, password, role } = req.body;

    const user = await User.create({
        username,
        email,
        password,
        role,
    });

    res.status(201).json({
        success: true,
        user: {
            id: user._id,
            role: user.role,
            
        },
        message: "Registration successful!",
    });
});

// Login user


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if password is correct
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = user.getJWTToken();

        // Send token and user info to the client
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                role: user.role,
                
            },
            token,
        });
    } catch (error) {
        console.error("Login Error: ", error); // Log the error for debugging
        res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
};
// leaderboard based on points
exports.getLeaderboard = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find().sort({ points: -1 }).select('username points'); // Fetch username and points
    res.status(200).json({
        success: true,
        leaderboard: users,
    });
});


//update user 
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id; // Get user ID from authenticated user
    const { completedTasks, points } = req.body; // Extract the completedTasks and points from request body

    // Find and update the user
    const user = await User.findByIdAndUpdate(userId, { completedTasks, points }, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user,
    });
});
// LogOut User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});

// Forget Password
exports.forgetPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHander("User not found", 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    const message = `Your Password reset token is :- \n\n ${resetPasswordUrl}\n\n If you have not requested this email then please ignore it`;

    try {
        await sendEmail({
            email: user.email,
            subject: ` Password Recovery`,
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });
        return next(new ErrorHander(error.message, 500));
    }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

    if (!user) {
        return next(new ErrorHander("Reset Password Token is invalid or has been expired", 404));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHander("Password does not match confirm Password", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, res);
});

// Get user details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

// Update User Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHander("Old Password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHander("Password does Not match", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
});

// Update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        user,
    });
});

// When admin wants to get all the users
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHander(`User not exist with id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        user
    });
});

// When admin wants to update user role
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        user,
    });
});

exports.getTimetable = catchAsyncErrors(async (req, res, next) => {
    try {
      // Ensure the authenticated user matches the user being accessed
      const user = await User.findById(req.user.id); // Fetch the authenticated user
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the user is allowed to access the timetable
      if (user.role !== 'user' || user.id !== req.params.userId) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }
  
      res.json(user.timetable);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching timetable' });
    }
  });
  
  exports.saveTimetable = catchAsyncErrors(async (req, res, next) => {
    try {
        // Check if the user is authenticated and has the right role
        if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const { date, detail } = req.body; // Destructure the event data from the request body

        // Find the user by ID and update their timetable
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize the timetable Map if it doesn't exist
        if (!user.timetable) {
            user.timetable = new Map();
        }

        // If the date doesn't exist in the timetable, create an array for it
        if (!user.timetable.has(date)) {
            user.timetable.set(date, []);
        }

        // Add the event detail to the specific date
        user.timetable.get(date).push(detail);

        await user.save(); // Save the updated user document
        res.status(200).json({ message: 'Timetable saved successfully' });
    } catch (error) {
        console.error('Error saving timetable:', error);
        res.status(500).json({ error: 'Error saving timetable' });
    }
});
//admin sharing resource

exports.createResource = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized access' });
    }

    const { title, description } = req.body;
    const fileUrl = req.file.path; // Get the path of the uploaded PDF

    const resource = new Resource({
        title,
        description,
        fileUrl,
        createdBy: req.user.id
    });

    await resource.save();
    console.log(title)
    // Notify users 
    // const users = await User.find();
    // users.forEach(async (user) => {
    //     user.notifications.push({
    //         type: 'resource',
    //         message: 'A new resource has been shared!',
    //         resourceId: resource._id,
    //         createdAt: new Date(),
    //     });
    //     await user.save();
    // });

    res.status(201).json({ message: 'Resource shared successfully!' });
};
//user getting resource
exports.getAllResources = async (req, res) => {
    try {
        // Ensure the user has a role of "user" to access this endpoint
        if (req.user.role !== 'user') {
            return res.status(403).json({ message: "Access denied. Only users can view resources." });
        }

        // Find resources where the uploader's role is admin
        const resources = await Resource.find({ 'uploadedBy.role': 'admin' });
        res.json(resources);
    } catch (error) {
        res.status(500)// Frontend - ChatBox.jsx  
        
    }
};
// // Create Quiz (Admin only)
// exports.createQuiz = async (req, res) => {
//     try {
//       // Check if the user is an admin
//       if (req.user.role !== 'admin') {
//         return res.status(403).json({ message: 'Access denied. Admins only.' });
//       }
  
//       // Extract quiz details from the request body
//       const { title, questions, timer } = req.body;
  
//       // Calculate total points
//       const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
  
//       // Create a new quiz document
//       const quiz = new Quiz({
//         title,
//         questions,
//         timer,
//         totalPoints,
//         createdBy: req.user._id, // Assume `req.user` contains the authenticated user info
//       });
  
//       // Save the quiz to the database
//       await quiz.save();
//       console.log(questions)
  
//       res.status(201).json({ message: 'Quiz created successfully', quiz });
//     } catch (error) {
//       res.status(500).json({ message: 'Failed to create quiz', error });
//     }
//   };
// Get Quiz for User
// exports.getQuiz = async (req, res) => {
//     try {
//       // Fetch the quizId based on some logic, e.g., logged-in user or random quiz
//       const quizId = req.user.quizId; 
    
//       if (!quizId) {
//         return res.status(400).json({ message: 'Quiz ID is required.' });
//       }
  
//       // Find the quiz by ID
//       const quiz = await Quiz.findById(quizId);
  
//       if (!quiz) {
//         return res.status(404).json({ message: 'Quiz not found' });
//       }
  
//       res.status(200).json({ quiz });
//     } catch (error) {
//       res.status(500).json({ message: 'Failed to retrieve quiz', error });
//     }
//   };
  
  
  
// // Submit Quiz
// exports.submitQuiz = async (req, res) => {
//     try {
//       const { quizId } = req.params;
//       const { answers } = req.body; // Expect an array of user answers, matching the quiz's question order
  
//       // Fetch the quiz
//       const quiz = await Quiz.findById(quizId);
//       if (!quiz) {
//         return res.status(404).json({ message: 'Quiz not found' });
//       }
  
//       let score = 0;
  
//       // Calculate score based on correct answers
//       quiz.questions.forEach((question, index) => {
//         if (answers[index] === question.correctAnswer) {
//           score += question.points;
//         }
//       });
  
//       // Update the user's points in the User model
//       const user = await User.findById(req.user._id);
//       user.points += score;
//       await user.save();
  
//       res.status(200).json({
//         message: 'Quiz submitted successfully',
//         score,
//         totalPoints: quiz.totalPoints,
//         correctAnswers: quiz.questions.map(q => q.correctAnswer),
//       });
//     } catch (error) {
//       res.status(500).json({ message: 'Failed to submit quiz', error });
//     }
//   };


exports.getUserList = async (req, res) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const currentUserId = req.user.id;
        const users = await User.find(
            { _id: { $ne: currentUserId } },
            { _id: 1, username: 1 } // Selecting both `_id` and `name` fields
        ); 
        
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user list', error });
    }
};
exports.getUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);  // Find user by ID
      if (!user) {
        return res.status(404).json({ message: 'User not found' });  // Handle case where user is not found
      }
      res.status(200).json(user);  // Send the user data in response
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });  // Handle server errors
    }
  };
  
  //delete timetable events 
  exports.deleteEvent = async (req, res) => {
    const { userId, eventId } = req.params;
    try {
        const result = await Timetable.findOneAndUpdate(
            { userId },
            { $pull: { events: { _id: eventId } } },
            { new: true }
        );
        if (!result) return res.status(404).json({ message: "Event not found" });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Error deleting event" });
    }
};
//edit timetable events
exports.editEvent = async (req, res) => {
    const { userId } = req.params;
    const { id, detail } = req.body;
    try {
        const event = await Timetable.findOneAndUpdate(
            { userId, "events._id": id },
            { $set: { "events.$.detail": detail } },
            { new: true }
        );
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: "Error updating event" });
    }
};
