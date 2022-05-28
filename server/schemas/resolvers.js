const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');
// const { sign } = require('jsonwebtoken');


const resolvers = {
    Query: {
        me: async (parent, { user = null, params }) => {
            return User.findOne({ $or: [{ _id: user ? user._id : params.id }, { username: params.username }], })
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

        saveBook: async (parent, { user, authors, description, bookId, image, link, title }) => { const updatedUser = await User.findOneAndUpdate(
            {_id: user._id },
            { $addToSet: {savedBooks: {
                authors: authors,
                description: description,
                bookId: bookId,
                image: image,
                link: link,
                title: title
            }}},
            {new: true, runValidators: true }
            );
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