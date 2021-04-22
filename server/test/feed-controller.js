const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const Post = require('../models/post');
const FeedController = require('../controllers/feed');

describe('Feed Controller', function () {
  before(function (done) {
    mongoose
      .connect(
        `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.rlpkk.mongodb.net/test-messages?retryWrites=true`,
        { useNewUrlParser: true, useUnifiedTopology: true }
      )
      .then((result) => {
        const user = new User({
          email: 'test@example.com',
          password: 'test',
          name: 'tester',
          posts: [],
          _id: '5c0f66b979af55031b34728a',
        });
        return user.save();
      })
      .then(() => {
        done();
      });
  });

  it('should add a created post to the posts of the creator.', function (done) {
    const req = {
      body: {
        title: 'Test Post',
        content: 'A test post',
      },
      file: {
        path: 'abc',
      },
      userId: '5c0f66b979af55031b34728a',
    };

    const res = {
      status: function () {
        return this;
      },
      json: function () {},
    };

    FeedController.createPost(req, res, () => {}).then((savedUser) => {
      expect(savedUser).to.have.property('posts');
      expect(savedUser.posts).to.have.length(1);
      done();
    });
  });

  after(function (done) {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
});
