const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'User works' }));

// @route   Post api/users/register
// @desc    Registers a user
// @access  Public
router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) return res.status(400).status({ email: 'Email already exists' });
      else {

        const avatar = gravatar.url(req.body.email, {
          s: '200', // Size
          r: 'pg',  // Rating
          d: 'mm'   // Default
        });

        const newUser = new User({
          name: req.body.name,
          password: req.body.password,
          email: req.body.email,
          avatar
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          })
        });
      }
    });
})

router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    // check if the user exists
    if (!user) return res.status(404).json({ email: 'User not found' });

    // check if the password is correct
    bcrypt.compare(password, user.password)
      .then(isMatch => {
        if (isMatch) {
          res.json({ msg: 'Success' });
        } else {
          return res.status(400).json({ password: 'Incorrect Password' });
        }
      })
  })
})

module.exports = router;