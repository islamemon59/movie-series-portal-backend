import { prisma } from "../../lib/prisma.js";

export const adminService = {
  async getDashboardStats() {
    const [
      totalUsers,
      totalMedia,
      totalReviews,
      pendingReviews,
      publishedReviews,
      totalComments,
      activeSubscriptions,
      totalMovies,
      totalSeries,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.media.count(),
      prisma.review.count(),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.review.count({ where: { status: "PUBLISHED" } }),
      prisma.comment.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.media.count({ where: { type: "MOVIE" } }),
      prisma.media.count({ where: { type: "SERIES" } }),
    ]);

    return {
      totalUsers,
      totalMedia,
      totalMovies,
      totalSeries,
      totalReviews,
      pendingReviews,
      publishedReviews,
      totalComments,
      activeSubscriptions,
    };
  },

  async getTopRatedMedia(limit = 10) {
    const media = await prisma.media.findMany({
      include: {
        reviews: {
          where: { status: "PUBLISHED" },
          select: { rating: true },
        },
        _count: {
          select: { reviews: { where: { status: "PUBLISHED" } } },
        },
      },
    });

    return media
      .map((item) => {
        const ratings = item.reviews.map((r) => r.rating);
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;
        const { reviews: _reviews, ...rest } = item;
        return { ...rest, avgRating: Math.round(avgRating * 10) / 10 };
      })
      .filter((m) => m._count.reviews > 0)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit);
  },

  async getMostReviewedMedia(limit = 10) {
    const media = await prisma.media.findMany({
      include: {
        reviews: {
          where: { status: "PUBLISHED" },
          select: { rating: true },
        },
        _count: {
          select: { reviews: { where: { status: "PUBLISHED" } } },
        },
      },
    });

    return media
      .map((item) => {
        const ratings = item.reviews.map((r) => r.rating);
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;
        const { reviews: _reviews, ...rest } = item;
        return { ...rest, avgRating: Math.round(avgRating * 10) / 10 };
      })
      .sort((a, b) => b._count.reviews - a._count.reviews)
      .slice(0, limit);
  },

  async getRecentUsers(limit = 10) {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async getAllUsers(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          _count: {
            select: { reviews: true, comments: true, subscriptions: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getSubscriptionAnalytics() {
    const [monthly, yearly, active, cancelled, expired] = await Promise.all([
      prisma.subscription.count({
        where: { plan: "MONTHLY", status: "ACTIVE" },
      }),
      prisma.subscription.count({
        where: { plan: "YEARLY", status: "ACTIVE" },
      }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({ where: { status: "CANCELLED" } }),
      prisma.subscription.count({ where: { status: "EXPIRED" } }),
    ]);

    return { monthly, yearly, active, cancelled, expired };
  },
};
