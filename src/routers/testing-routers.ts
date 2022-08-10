import {Request, Response, Router} from "express";
import {BloggerModel} from "../repositories/modeles/blogger.model";
import {UserModel} from "../repositories/modeles/user.model";
import {PostsModel} from "../repositories/modeles/post.model";
import {CommentModel} from "../repositories/modeles/comment.model";


export const testingRouter = Router({})

testingRouter.delete('/all-data', async (req: Request, res: Response) =>{
  if(await BloggerModel.deleteMany({}) &&
    await UserModel.deleteMany({}) &&
    await PostsModel.deleteMany({}) &&
    await CommentModel.deleteMany({}))
   {
        res.status(204).send('All data is deleted')
        return
    }

})