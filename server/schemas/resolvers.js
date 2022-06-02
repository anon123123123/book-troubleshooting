const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');
// const { sign } = require('jsonwebtoken');


const resolvers = {
    Query: {
        me: async (parent, { user = null }, context) => {
            return User.findOne({ $or: [{ _id: user ? user._id : context.user._id }, { username: context.user.username }], })
        },
    },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
          },
        
          login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
              throw new AuthenticationError('No user found with this email address');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);
            return { token, user };
          },

        saveBook: async (parent, { description,bookId,image,link,title  }, context) => { 
          if (context) {
          const updatedUser = await User.findOneAndUpdate(
            {_id: context.user._id },
            { $addToSet: {savedBooks: {
                // authors: authors,
                description: description,
                bookId: bookId,
                image: image,
                link: link,
                title: title
            }}},
            {new: true, runValidators: true }
            ); } 
            else {
              throw new AuthenticationError('You need to be logged in!');
            }
        },
        removeBook: async (parent, { user, bookId }) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: user.id },
                { $pull: { savedBooks: { bookId: bookId }}},
                { new: true }
            );
       },
    }
};

module.exports = resolvers;