import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../types/index.js";

export const watchlistService = {
  async toggle(userId: string, mediaId: string) {
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw new AppError(404, "Media not found");

    const existing = await prisma.watchlist.findUnique({
      where: { userId_mediaId: { userId, mediaId } },
    });

    if (existing) {
      await prisma.watchlist.delete({ where: { id: existing.id } });
      return { added: false };
    }

    await prisma.watchlist.create({ data: { userId, mediaId } });
    return { added: true };
  },

  async getUserWatchlist(userId: string, page = 1, limit = 12) {
    const [data, total] = await Promise.all([
      prisma.watchlist.findMany({
        where: { userId },
        include: {
          media: {
            include: {
              reviews: {
                where: { status: "PUBLISHED" },
                select: { rating: true },
              },
              _count: {
                select: { reviews: { where: { status: "PUBLISHED" } } },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.watchlist.count({ where: { userId } }),
    ]);

    const watchlistWithRating = data.map((item) => {
      const ratings = item.media.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;
      const { reviews: _reviews, ...mediaRest } = item.media;
      return {
        id: item.id,
        createdAt: item.createdAt,
        media: { ...mediaRest, avgRating: Math.round(avgRating * 10) / 10 },
      };
    });

    return {
      data: watchlistWithRating,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async check(userId: string, mediaId: string) {
    const item = await prisma.watchlist.findUnique({
      where: { userId_mediaId: { userId, mediaId } },
    });
    return { inWatchlist: !!item };
  },
};
