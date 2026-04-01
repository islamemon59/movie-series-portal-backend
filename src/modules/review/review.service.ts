import { prisma } from "../../lib/prisma.js";
import type { CreateReviewInput, UpdateReviewInput } from "./review.schema.js";
import { AppError } from "../../types/index.js";

export const reviewService = {
  async create(userId: string, data: CreateReviewInput) {
    const media = await prisma.media.findUnique({
      where: { id: data.mediaId },
    });
    if (!media) throw new AppError(404, "Media not found");

    const existing = await prisma.review.findFirst({
      where: { userId, mediaId: data.mediaId },
    });
    if (existing)
      throw new AppError(409, "You have already reviewed this title");

    return prisma.review.create({
      data: { ...data, userId },
      include: {
        user: { select: { id: true, name: true, image: true } },
        media: { select: { id: true, title: true } },
      },
    });
  },

  async getByMedia(mediaId: string, page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where: { mediaId, status: "PUBLISHED" },
        include: {
          user: { select: { id: true, name: true, image: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { mediaId, status: "PUBLISHED" } }),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, image: true } },
        media: { select: { id: true, title: true, posterUrl: true } },
        comments: {
          where: { parentId: null },
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
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!review) throw new AppError(404, "Review not found");
    return review;
  },

  async getUserReviews(userId: string, page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        include: {
          media: {
            select: { id: true, title: true, posterUrl: true, type: true },
          },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { userId } }),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async update(id: string, userId: string, data: UpdateReviewInput) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError(404, "Review not found");
    if (review.userId !== userId) throw new AppError(403, "Not authorized");
    if (review.status === "PUBLISHED")
      throw new AppError(400, "Cannot edit a published review");

    return prisma.review.update({
      where: { id },
      data: { ...data, status: "PENDING" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        media: { select: { id: true, title: true } },
      },
    });
  },

  async delete(id: string, userId: string, isAdmin = false) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError(404, "Review not found");
    if (!isAdmin && review.userId !== userId)
      throw new AppError(403, "Not authorized");
    if (!isAdmin && review.status === "PUBLISHED")
      throw new AppError(400, "Cannot delete a published review");

    return prisma.review.delete({ where: { id } });
  },

  async updateStatus(id: string, status: "PUBLISHED" | "UNPUBLISHED") {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError(404, "Review not found");

    return prisma.review.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, image: true } },
        media: { select: { id: true, title: true } },
      },
    });
  },

  async toggleLike(reviewId: string, userId: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new AppError(404, "Review not found");

    const existingLike = await prisma.like.findUnique({
      where: { userId_reviewId: { userId, reviewId } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return { liked: false };
    }

    await prisma.like.create({ data: { userId, reviewId } });
    return { liked: true };
  },

  async getPending(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where: { status: "PENDING" },
        include: {
          user: { select: { id: true, name: true, image: true, email: true } },
          media: { select: { id: true, title: true, type: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { status: "PENDING" } }),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getAllAdmin(page = 1, limit = 10, status?: string) {
    const where = status
      ? { status: status as "PENDING" | "PUBLISHED" | "UNPUBLISHED" }
      : {};

    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true, email: true } },
          media: { select: { id: true, title: true, type: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async checkUserLike(reviewId: string, userId: string) {
    const like = await prisma.like.findUnique({
      where: { userId_reviewId: { userId, reviewId } },
    });
    return { liked: !!like };
  },
};
