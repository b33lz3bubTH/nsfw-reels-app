import express, { Request, Response } from "express";
import UploadService, { ContentAdapter } from "../../plugins/lfs-service";
import { UserService, AccountType } from "../users/service";
import { ContentService } from "./services";
import { randomUUID } from "crypto";
import { ContentEvent, EventNames } from "../../events-emitters";
import fs from "fs";


export class ContentsControllers {
  private router = express.Router();

  constructor(private uploadService = new UploadService("uploads"),
    private userService = new UserService(),
    private contentService = new ContentService()
  ) {
    this.initializeRoutes();

  }

  private streamPost = async (req: Request, res: Response) => {
    try {
      const postId = req.params.postId;
      const { token } = req.query;

      if (!token || !postId) {
        throw new Error("token not found");
      }


      const user = await this.userService.userViaSession(token.toString());
      if (!user) {
        throw new Error("token invalid");
      }
      const post = await this.contentService.getPost(postId);
      if (!post) {
        throw new Error(`invalid post`);
      }

      const videoStats = fs.statSync(post.filePath);
      const videoSize = videoStats.size;

      const range = req.headers.range;

      let chunkStart = 0;
      let chunkEnd = 10 ** 6 - 1;

      if (range) {
        const [start, end] = range
          .replace(/bytes=/, '')
          .split('-')
          .map((val) => parseInt(val, 10));

        chunkStart = Math.max(start, 0);
        chunkEnd = Math.min(end || chunkStart + (10 ** 6 - 1), videoSize - 1); // Default to 1MB chunk if `end` is not provided
      }

      res.writeHead(206, {
        'Content-Range': `bytes ${chunkStart}-${chunkEnd}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkEnd - chunkStart + 1,
        'Content-Type': 'video/mp4',
      });

      const videoStream = fs.createReadStream(post.filePath, { start: chunkStart, end: chunkEnd });
      videoStream.pipe(res);

      videoStream.on('end', () => {
        console.log('Stream ended');
      });
    } catch (error: any) {
      res.status(500).json({ message: (error as Error).message });
    }

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

      if (user.accountType !== AccountType.uploader) {
        throw new Error("user is not an uploader");
      }

      const post = await this.contentService.createPost({
        filePath,
        slug: randomUUID().toString(),
        tags: tags.toString(),
        caption: caption.toString(),
        email: user.email
      });

      ContentEvent.emit(EventNames.content_uploaded, JSON.stringify(post));
      res.status(201).json({ filePath, content: post.slug });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  private initializeRoutes(): void {

    this.router.get("/content/:postId", this.streamPost);
    this.router.post("/upload", this.uploadService.handleUpload(ContentAdapter), this.contentUpload);
  }

  public getRouter(): express.Router {
    return this.router;
  }
}
