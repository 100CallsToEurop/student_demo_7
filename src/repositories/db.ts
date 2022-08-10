import mongoose from "mongoose";
import 'dotenv/config'

const mongoUri = process.env.MONGO_URI || `mongodb+srv://user:testDatabase@cluster0.tuuab.mongodb.net/backend?retryWrites=true&w=majority`;

export async function runDb(){
    try{
        await mongoose.connect(mongoUri)
        console.log("Connected successfully to mongo server")
    }catch(err){
        console.log("Can't connect to db")
        console.log(err)
        await mongoose.disconnect()
    }
}