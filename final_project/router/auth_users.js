const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const session = require('express-session')
const app = express();
let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let userswithsamename = users.filter((user)=>{
  return user.username === username
});
if(userswithsamename.length > 0){
  return true;
} else {
  return false;
}
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validuser = users.filter((user)=>{
  return (user.username === username && user.password === password)
});
if(validuser.length > 0){
  return true;
} else {
  return false;
}
}



regd_users.use("/books", function auth(req,res,next){
  if(req.session.authorization) {
      token = req.session.authorization['accessToken'];
      jwt.verify(token, "access",(err,user)=>{
          if(!err){
              req.user = user;
              next();
          }
          else{
              return res.status(403).json({message: "User not authenticated"})
          }
       });
   } else {
       return res.status(403).json({message: "User not logged in"})
   }
});


//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
 
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60  });
    
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});



//app.use(session({secret:"fingerpint"},resave=true,saveUninitialized=true));

//app.use(express.json());

app.use("/books", function auth(req,res,next){
   if(req.session.authorization) { //get the authorization object stored in the session
       token = req.session.authorization['accessToken']; //retrieve the token from authorization object
       jwt.verify(token, "access",(err,user)=>{ //Use JWT to verify token
           if(!err){
               req.user = user;
               next();
           }
           else{
               return res.status(403).json({message: "User not authenticated"})
           }
        });
    } else {
        return res.status(403).json({message: "User not logged in"})
    }
});


//This is the main end point we will be accessing
app.get("/auth/get_message", (req,res) => {
  return res.status(200).json({message: "Hello, You are an authenticated user. Congratulations!"});
});



// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;
  let filtered_book = books[isbn]
  if (filtered_book) {
      let review = req.query.review;
      let reviewer = req.session.authorization['username'];
      if(review) {
          filtered_book['reviews'][reviewer] = review;
          books[isbn] = filtered_book;
      }
      res.send(`The review for the book with ISBN  ${isbn} has been added/updated.`);
  }
  else{
      res.send("Unable to find this ISBN!");
  }
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;
  let filtered_book = books[isbn]
  if (filtered_book) {
      let delete_book_ = req.query.review;
      let delete_book_reviews = req.session.authorization['username'];
      if (books) {
        delete books.reviews[username];
        return res.status(200).json(books);
    }
      res.send(`The review for the book with ISBN  ${isbn} has been deleted.`);
  }
  else{
      res.send("Unable to find this ISBN!");
  }
  return res.status(404).json({ message: "Invalid ISBN" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
