import mongoose from 'mongoose'

export const connect = () => mongoose.connect('mongodb://localhost:27017/homstall_test', {useNewUrlParser: true, useUnifiedTopology: true})

export const disconnect = () => mongoose.connection.close()
