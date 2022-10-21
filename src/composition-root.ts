import {Container} from "inversify";
import {UsersService} from "./domian/users.service";
import {UsersRepository} from "./repositories/users.repository";
import {UsersController} from "./controllers/user.controller";
import {AuthController} from "./controllers/auth.controller";
import {AuthService} from "./domian/auth.service";
import {CommentController} from "./controllers/comment.controller";
import {CommentService} from "./domian/comments.service";
import {CommentsRepository} from "./repositories/comments-repository-db";
import {PostsService} from "./domian/posts.services";
import {BloggersService} from "./domian/bloggers.service";
import {BloggersRepository} from "./repositories/bloggers-repository-db";
import {BloggerController} from "./controllers/blogger.controller";
import {PostsRepository} from "./repositories/posts-repository-db";
import {PostsController} from "./controllers/post.controller";
import {EmailAdapter} from "./adapters/email-adapter";
import {GameController} from "./controllers/game.controller";
import {GameService} from "./domian/game.service";
import {GameRepository} from "./repositories/game-repository-db";
import {QuestionRepository} from "./repositories/question-repository";
import {QuestionService} from "./domian/question.service.";
import {QuestionController} from "./controllers/question.controller";

export const container = new Container()
//Auth
container.bind(AuthController).to(AuthController)
container.bind<AuthService>(AuthService).to(AuthService)
//User
container.bind(UsersController).to(UsersController)
container.bind<UsersService>(UsersService).to(UsersService)
container.bind<UsersRepository>(UsersRepository).to(UsersRepository)
//Comment
container.bind(CommentController).to(CommentController)
container.bind<CommentService>(CommentService).to(CommentService)
container.bind<CommentsRepository>(CommentsRepository).to(CommentsRepository)
//Blogger
container.bind(PostsController).to(PostsController)
container.bind<PostsService>(PostsService).to(PostsService)
container.bind<PostsRepository>(PostsRepository).to(PostsRepository)
//Post
container.bind(BloggerController).to(BloggerController)
container.bind<BloggersService>(BloggersService).to(BloggersService)
container.bind<BloggersRepository>(BloggersRepository).to(BloggersRepository)
//Email
container.bind(EmailAdapter).to(EmailAdapter)
//Game
container.bind(GameController).to(GameController)
container.bind<GameService>(GameService).to(GameService)
container.bind<GameRepository>(GameRepository).to(GameRepository)
//Question
container.bind(QuestionController).to(QuestionController)
container.bind<QuestionService>(QuestionService).to(QuestionService)
container.bind<QuestionRepository>(QuestionRepository).to(QuestionRepository)