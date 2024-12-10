import { PrismaSingleton } from "../../dbpool/singleton";
import { PrismaClient, Post } from "@prisma/client";


export class ContentService {
  constructor(private prisma: PrismaClient = PrismaSingleton.getInstance()) { }


  async createPost(data: Pick<Post, "slug" | "tags" | "caption" | "filePath" | "email">) {
    return this.prisma.post.create({
      data: {
        ...data
      }
    });
  }

  async getPost(slug: string) {
    return this.prisma.post.findFirst({
      where: {
        slug
      }
    });
  }

  async consumePostsPagination(
    take: number = 10, // Number of posts per page
    skip: number = 0,  // Number of posts to skip
    filter: Partial<Pick<Post, "email" | "slug">> = {}, // Filters for query
    sortField: keyof Post = "createdAt", // Field to sort by
    sortOrder: "asc" | "desc" = "desc" // Sort order: ascending or descending
  ) {
    return this.prisma.post.findMany({
      where: filter,
      take,
      skip,
      orderBy: {
        [sortField]: sortOrder,
      },
    });
  }


  async consumeLatestPosts(afterDate: Date, take: number = 10, filter: Partial<Pick<Post, "email">> = {}) {
    return this.prisma.post.findMany({
      where: {
        ...filter,
        createdAt: {
          gt: afterDate, // Fetch posts created after the given date
        },
      },
      take, // Limit the number of posts
      orderBy: {
        createdAt: "desc", // Sort by the latest posts
      },
    });
  }


}
