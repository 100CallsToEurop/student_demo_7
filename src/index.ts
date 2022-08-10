import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
//Routers


//Database
import {runDb} from "./repositories/db";
import {authRouter} from "./routers/auth-routers";
import {usersRouter} from "./routers/users-routers";
import {commentsRouter} from "./routers/comments-routers";
import {bloggersRouter} from "./routers/bloggers-routes";
import {postsRouter} from "./routers/posts-routes";
import {testingRouter} from "./routers/testing-routers";



//Constant
const jsonMiddleware = bodyParser.json()
const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(cookieParser())
app.use(jsonMiddleware)
app.set('trust proxy', true);

app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/comments', commentsRouter)
app.use('/bloggers', bloggersRouter)
app.use('/posts', postsRouter)
app.use('/testing', testingRouter)

const startApp = async() =>{
    await runDb()
    app.listen(port, ()=>{
        console.log(`Example app listening on port ${port}`)
    })
}

startApp()

