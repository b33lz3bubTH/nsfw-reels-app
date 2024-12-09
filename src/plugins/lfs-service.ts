import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import multer, { StorageEngine } from "multer";

interface FileValidationConfig {
  allowed: string[]; // Allowed file extensions
  maxSize: number; // Maximum file size in MB
}

class FileAdapter {
  private config: FileValidationConfig;

  constructor(config: FileValidationConfig) {
    this.config = config;
  }

  public validate(req: Request): void {
    const file = req.file; // Type-safe access to the file

    if (!file) {
      throw new Error("No file uploaded");
    }

    const fileExtension = file.originalname.split(".").pop()?.toLowerCase();
    const fileSizeMB = file.size / (1024 * 1024);

    // Validate file extension
    if (!this.config.allowed.includes(fileExtension || "")) {
      throw new Error(`Invalid file type. Allowed: ${this.config.allowed.join(", ")}`);
    }

    // Validate file size
    if (fileSizeMB > this.config.maxSize) {
      throw new Error(`File size exceeds the limit of ${this.config.maxSize} MB`);
    }
  }
}

// Predefined Adapters
export const VideoAdapter = new FileAdapter({ allowed: ["mp4", "mkv"], maxSize: 20 });
export const ImageAdapter = new FileAdapter({ allowed: ["jpg", "png", "gif"], maxSize: 5 });
export const DocumentAdapter = new FileAdapter({ allowed: ["pdf", "docx"], maxSize: 10 });
export const ContentAdapter = new FileAdapter({allowed: ["jpg", "png", "gif", "mp4", "avi", "jpeg"], maxSize: 69});

class UploadService {
  private upload: multer.Multer;
  private uploadFolder: string;

  constructor(uploadFolder: string) {
    this.uploadFolder = uploadFolder;

    this.upload = multer({
      storage: multer.diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
          cb(null, this.uploadFolder); // Set upload directory
        },
        filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName); // Generate unique name
        }
      }) as StorageEngine
    });
  }

  public handleUpload(adapter: FileAdapter) {
    return (req: Request, res: Response, next: NextFunction) => {
      this.upload.single("file")(req, res, (err: Error | null | unknown) => {
        if (err) {
          return res.status(400).json({ message: (err as any)?.message });
        }

        try {
          adapter.validate(req); // Validate using the adapter
          return next(); // Explicitly return after calling next()
        } catch (validationError: any) {
          // Cleanup file if validation fails
          if (req.file?.path) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(400).json({ message: validationError.message });
        }
      });
    };
  }

  public getFilePath(req: Request): string {
    const file = req.file;
    if (!file) {
      throw new Error("No file uploaded");
    }
    return path.resolve(this.uploadFolder, file.filename);
  }
}

export default UploadService;
