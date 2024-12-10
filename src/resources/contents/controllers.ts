import express, { Request, Response } from "express";
import UploadService, { ContentAdapter } from "../../plugins/lfs-service";
import { UserService, AccountType } from "../users/service";
import { ContentService } from "./services";
import { randomUUID } from "crypto";


export class ContentsControllers {
  private router = express.Router();

  constructor(private uploadService = new UploadService("uploads"),
    private userService = new UserService(),
    private contentService = new ContentService()
  ) {
    this.initializeRoutes();

  }

  private contentUpload = async (req: Request, res: Response) => {
    try {
      const filePath = this.uploadService.getFilePath(req);
      const { caption, tags } = req.body;

      const { token } = req.query;

      if (!token) {
        throw new Error("token not found");
      }

      const user = await this.userService.userViaSession(token.toString());
      if (!user) {
        throw new Error("token invalid");
      }

      if(user.accountType !== AccountType.uploader){
        throw new Error("user is not an uploader");
      }


      const post = await this.contentService.createPost({
        filePath,
        slug: randomUUID().toString(),
        tags: tags.toString(),
        caption: caption.toString(),
        email: user.email
      });


      res.status(201).json({ filePath, content: post.slug });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  private initializeRoutes(): void {
    this.router.post("/upload", this.uploadService.handleUpload(ContentAdapter), this.contentUpload)
  }

  public getRouter(): express.Router {
    return this.router;
  }
}
