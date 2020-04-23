//jshint esversion:8
const express = require('express'); // initializing the express node module package
const router = express.Router(); // initialize the router function
const nodeMailer = require("nodemailer"); // initializing the nodemailer package for sending emails

// MODELS
const course = require("../models/course"); // calling the course model from the model folder
const user = require("../models/User"); // calling the user model from the model
const purchase = require("../models/purchase"); // calling the purchase model from the model
const blogPost = require("../models/blog"); // calling the blog post model from the model

router.use(express.static("public")); // set the middleware function to send the static files
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth'); // initialize the authenticated functionality

//// HOME PAGE ROUTE and here the blogs, courses, courses count will show up
router.get("/", (req, res) => {
    course.findOne({}, (course).countDocuments((err, courseCount) => {
        blogPost.find({}, (err, blogs) => {
            user.find({}).countDocuments((err, count) => {
                res.render("index", { course, blogs, count, courseCount });
            });
        });
    }));
});

// COURSE PAGE ROUTE in this route the course details will show up
router.get("/course", (req, res) => {
    course.findOne({}, (err, course) => {
        res.render("courses", { course });
    });
});

// CONTACT PAGE ROUTE / on request the contact page will show up on this route
router.get("/contact", (req, res) => {
    res.render("contact");
});

// BLOG PAGE ROUTE / in this page the blogs will be posted and shown up in a sorted system
router.get("/blog", (req, res) => {
    blogPost.find({}).sort({ _id: -1 }).then(blogs => {
        if (blogs) {
            res.render("blog", { blogs });
        } else {
            req.flash("success_msg", "NO ONE HAS POSTED ANY BLOG HERE !");
            console.log("no blog found");
            res.render("blog", { blogs: false });
        }
    });
});

// BUY ROUTE / in this route the user can see a preview for which he is going to pay and will show up a payment gateway
router.post("/buy", (req, res) => {
    course.findOne({ code: req.body.id }, (err, course) => {
        if (course) {
            res.render("payment", { course, user });
        }
    });
});


// PAYMENT ROUTE / in this route a user can be proceeded to pay bill and get that product on their account if logged in
router.post("/payment", (req, res) => {
    const { cname, ccode, cprice, email } = req.body;
    user.findOne({ email: email }).then(user => {
        course.findOne({ code: ccode }, (err, course) => {
            if (user) {
                const newPurchaseItem = new purchase({
                    name: cname,
                    code: ccode,
                    price: cprice,
                    email: email
                });
                newPurchaseItem.save()
                    .then(purchaseItem => {
                        req.flash("success_msg", "PAYMENT SUCCESSFULLY DONE ! CHECK YOUR CART");
                        res.redirect("/dashboard");
                    });
            } else {
                req.flash("error_msg", "EMAIL ID IS NOT REGISTERED ! REGISTER FIRST");
                res.redirect("/users/register");
            }
        }).catch(err => console.log(err));
    });
});

// Dashboard // in this route the user can see his dashboard and his details
router.get("/dashboard", ensureAuthenticated, (req, res) => {
    res.render("dashboard", { user: req.user });
});

// SHOPPING CART // this is the route for all purchasing products' list when and which product has he bought all has been stored in the database and shown in this route
router.post("/mycart", ensureAuthenticated, (req, res) => {
    const email = req.body.email;
    user.findOne({ email: email }).then(user => {
        purchase.find({ email: email }, (err, found) => {
            if (found) {
                purchase.find({ email: email }).countDocuments((err, count) => {
                    if (count) {
                        res.render("mycart", { found, count: count, user: req.user });
                    } else {
                        req.flash("error_msg", "YOUR SHOPPING CART IS EMPTY");
                        res.redirect("/dashboard");
                    }
                });
            } else {
                req.flash("error_msg", "YOUR SHOPPING CART IS EMPTY");
                res.redirect("/dashboard");
            }
        });
    });
});

// REMOVING SHOPPING CARTS // user can remove their purchase item that he purchased once.
router.post("/deleteCart", (req, res) => {
    const id = req.body.id;
    purchase.deleteOne(id).then(found => {
        if (found) {
            req.flash("success_msg", "CART ITEM HAS DELETED");
            res.redirect("/dashboard");
        } else {
            res.status(404).send("Error !");
        }
    }).catch(err => console.log(err));
});


// BLOG FORM ROUTE // this is the route to write the blog and post it to the blog section
router.get("/blogForm", ensureAuthenticated, (req, res) => {
    res.render("blogForm", { user: req.user });
});

// BLOG POST ROUTE // this is the route to write the blog and post it to the blog section
router.post("/blogForm", (req, res) => {
    const { name, title, blog } = req.body;
    blogPost.findOne({ title: title, blog: blog }, (err, blogs) => {
        if (blogs) {
            req.flash("error_msg", "THIS BLOG POST HAS ALREADY BEEN PUBLISHED TRY A NEW ONE");
            res.redirect("/blogForm");
        } else {
            const newBlog = new blogPost({
                name: name,
                title: title,
                blog: blog
            });
            newBlog.save()
                .then(blog => {
                    req.flash("success_msg", "YOUR BLOG HAS BEEN POSTED ! CHEK ON BLOG SITE");
                    res.redirect("/blogForm");
                }).catch(err => console.log(err));
        }
    });
});

// NODEMAILER FOR CONTACT INFO // any user can send about their views and complains through this route
router.post("/mail", (req, res) => {
    const output = `
  <p>You have a new contact request</p>
  <h3>Contact Details</h3>
  <ul>  
    <li>Name: ${req.body.name}</li>
    <li>Email: ${req.body.email}</li>
    <li>Text: ${req.body.subject}</li>
  </ul>
  <h3>Message</h3>
  <p>${req.body.message}</p>`;

    const transport = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        auth: {
            user: "ingabirejacky94@gmail.com", // replace with your Mailtrap credentials
            pass: "lbgrjsxwwbjaaekd" // 16 character app genereted password from google(app password)
        },
        tls: {
            rejectUnauthorized: false
        }
    }); // log information in console
    let mailOptions = {
        from: '"Polyglotian Contact" <ingabirejacky94@gmail.com>',
        to: 'ingabirejacky94@gmail.com',
        subject: 'Node Contact Request',
        text: 'Hello world?',
        html: output
    };
    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodeMailer.getTestMessageUrl(info));
        req.flash("success_msg", "MESSAGE SENT");
        res.render('contact');
    });

});

// MY BLOG ROUTE // in this route only the particuler user can see their posted blog as a list
router.post('/myblog', ensureAuthenticated, (req, res) => {
    const name = req.body.name;
    blogPost.find({ name: name }, (err, blog) => {
        if (blog) {
            blogPost.find({ name: name }).countDocuments((err, count) => {
                if (count) {
                    res.render("myblog", { blog, count: count });
                }
                if (count == 0) {
                    req.flash("success_msg", "YOUR BLOG IS EMPTY");
                    res.redirect("/blogForm");
                }
            });
        } else {
            req.flash("success_msg", "YOUR BLOG LIST IS EMPTY");
            res.redirect("/blogForm");
        }
    });
});

// BLOG DELETE // by this route the user can delete their blog 
router.post("/blogDelete", ensureAuthenticated, (req, res) => {
    const id = req.body.id;
    blogPost.deleteOne({ "_id": id }).then(deleted => {
        if (deleted) {
            req.flash("success_msg", "BLOG HAS DELETED");
            res.redirect("/dashboard");
        } else {
            console.log(err);
        }
    });
});

module.exports = router;