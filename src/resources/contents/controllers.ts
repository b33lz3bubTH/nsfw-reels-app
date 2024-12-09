import express, { Request, Response } from "express";
import UploadService, { ContentAdapter } from "../../plugins/lfs-service";


export class ContentsControllers {
  private router = express.Router();

  constructor(private uploadService = new UploadService("uploads")) {
    this.initializeRoutes();

  }

  private contentUpload = async (req: Request, res: Response) => {
    try {
      const filePath = this.uploadService.getFilePath(req);
      res.status(201).json({ filePath });
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
