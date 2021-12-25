require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_SERVER);
const Schema = mongoose.Schema;

//create schema
const taskSchema = new Schema({
  task: String,
});


//connect with mongoose
const Task = mongoose.model("Task", taskSchema);


//initial home page render
app.get("/", (req, res) => {
  Task.find({}, (err, foundtasks) => {
    if (err) {
      res.send(err);
    } else {
      if (!foundtasks) {
        const task = new Task({
          task: "please add a new task",
        });

        task.save();
      } else {
        res.render("home", {
          task: foundtasks,
        });
      }
    }
  });
});




//add a new task to database and render
app.post("/", (req, res) => {
  const newTask = req.body.newTask;
  if (!newTask) {
    res.redirect("/");
  } else {
    const task = new Task({
      task: newTask,
    });

    task.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  }
});


//use selected task id to delete the task from the databas and redirect to homepage
app.post("/delete", (req, res) => {
  const clickedTask = req.body.delete;

  //this finds id of the checked item and removesit
  Task.findByIdAndRemove(clickedTask, function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

//update selected task and redirect to home page
app.post("/edit",(req,res) =>{
  if(!req.body.newTask){
    res.redirect("/")

  }else{
    Task.findOneAndUpdate({_id:req.body.taskId},
    {task:req.body.newTask},(err) => {
      if(err){
        console.log(err);
      }else{
        res.redirect("/")

      }
    }
    )
}
  }
  )


// use selected task id to render the edit page for tha task
app.post("/editlink",(req,res) => {
   
  Task.findOne({_id:req.body.taskId},(err,foundtask) =>{
    if(err){
      console.log(err);
    }else{
      
      res.render("edit",{
        taskId: foundtask._id,
        task: foundtask.task

      });
    }
    
  })

})



app.listen(3000, () => {
  console.log(`Server is running on port http://localhost:3000`);
});
