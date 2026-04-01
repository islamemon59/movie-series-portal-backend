import { prisma } from "../../lib/prisma.js";
import type {
  CreateCommentInput,
  UpdateCommentInput,
} from "./comment.schema.js";
import { AppError } from "../../types/index.js";

export const commentService = {
  async create(userId: string, data: CreateCommentInput) {
    const review = await prisma.review.findUnique({
      where: { id: data.reviewId },
    });
    if (!review) throw new AppError(404, "Review not found");

    if (data.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) throw new AppError(404, "Parent comment not found");
      if (parent.reviewId !== data.reviewId)
        throw new AppError(
          400,
          "Parent comment does not belong to this review",
        );
    }

    return prisma.comment.create({
      data: {
        content: data.content,
        reviewId: data.reviewId,
        parentId: data.parentId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
  },

  async getByReview(reviewId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      prisma.comment.findMany({
        where: { reviewId, parentId: null },
        include: {
          user: { select: { id: true, name: true, image: true } },
          replies: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.comment.count({ where: { reviewId, parentId: null } }),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async update(id: string, userId: string, data: UpdateCommentInput) {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new AppError(404, "Comment not found");
    if (comment.userId !== userId) throw new AppError(403, "Not authorized");

    return prisma.comment.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
  },

  async delete(id: string, userId: string, isAdmin = false) {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new AppError(404, "Comment not found");
    if (!isAdmin && comment.userId !== userId)
      throw new AppError(403, "Not authorized");

    return prisma.comment.delete({ where: { id } });
  },
};
