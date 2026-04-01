import { prisma } from "../../lib/prisma.js";
import type {
  CreateMediaInput,
  UpdateMediaInput,
  MediaQueryInput,
} from "./media.schema.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../types/index.js";

export const mediaService = {
  async getAll(query: MediaQueryInput) {
    const {
      page,
      limit,
      search,
      type,
      genre,
      platform,
      yearFrom,
      yearTo,
      ratingMin,
      pricing,
      sort,
      featured,
    } = query;

    const where: Prisma.MediaWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { director: { contains: search, mode: "insensitive" } },
        { cast: { hasSome: [search] } },
      ];
    }
    if (type) where.type = type;
    if (genre) where.genres = { has: genre };
    if (platform) where.streamingPlatforms = { has: platform };
    if (pricing) where.pricing = pricing;
    if (featured !== undefined) where.featured = featured;
    if (yearFrom || yearTo) {
      where.releaseYear = {};
      if (yearFrom) where.releaseYear.gte = yearFrom;
      if (yearTo) where.releaseYear.lte = yearTo;
    }

    let orderBy: Prisma.MediaOrderByWithRelationInput = {};
    switch (sort) {
      case "latest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "title":
        orderBy = { title: "asc" };
        break;
      case "rating":
        orderBy = { reviews: { _count: "desc" } };
        break;
      case "most-reviewed":
        orderBy = { reviews: { _count: "desc" } };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [data, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          reviews: {
            where: { status: "PUBLISHED" },
            select: { rating: true },
          },
          _count: {
            select: {
              reviews: { where: { status: "PUBLISHED" } },
              watchlistItems: true,
            },
          },
        },
      }),
      prisma.media.count({ where }),
    ]);

    const mediaWithRating = data.map((item) => {
      const ratings = item.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;
      const { reviews: _reviews, ...rest } = item;
      return { ...rest, avgRating: Math.round(avgRating * 10) / 10 };
    });

    // Filter by minimum rating if requested
    let filtered = mediaWithRating;
    if (ratingMin) {
      filtered = mediaWithRating.filter((m) => m.avgRating >= ratingMin);
    }

    return {
      data: filtered,
      pagination: {
        page,
        limit,
        total: ratingMin ? filtered.length : total,
        totalPages: Math.ceil((ratingMin ? filtered.length : total) / limit),
      },
    };
  },

  async getById(id: string) {
    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        reviews: {
          where: { status: "PUBLISHED" },
          include: {
            user: { select: { id: true, name: true, image: true } },
            _count: { select: { likes: true, comments: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            reviews: { where: { status: "PUBLISHED" } },
            watchlistItems: true,
          },
        },
      },
    });

    if (!media) throw new AppError(404, "Media not found");

    const ratings = media.reviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    return { ...media, avgRating: Math.round(avgRating * 10) / 10 };
  },

  async create(data: CreateMediaInput) {
    return prisma.media.create({ data });
  },

  async update(id: string, data: UpdateMediaInput) {
    const exists = await prisma.media.findUnique({ where: { id } });
    if (!exists) throw new AppError(404, "Media not found");
    return prisma.media.update({ where: { id }, data });
  },

  async delete(id: string) {
    const exists = await prisma.media.findUnique({ where: { id } });
    if (!exists) throw new AppError(404, "Media not found");
    return prisma.media.delete({ where: { id } });
  },

  async getFeatured() {
    const media = await prisma.media.findMany({
      where: { featured: true },
      include: {
        reviews: {
          where: { status: "PUBLISHED" },
          select: { rating: true },
        },
        _count: {
          select: { reviews: { where: { status: "PUBLISHED" } } },
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return media.map((item) => {
      const ratings = item.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;
      const { reviews: _reviews, ...rest } = item;
      return { ...rest, avgRating: Math.round(avgRating * 10) / 10 };
    });
  },

  async getTopRated() {
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
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 10);
  },

  async getNewlyAdded() {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
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

    return media.map((item) => {
      const ratings = item.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;
      const { reviews: _reviews, ...rest } = item;
      return { ...rest, avgRating: Math.round(avgRating * 10) / 10 };
    });
  },

  async getGenres() {
    const media = await prisma.media.findMany({ select: { genres: true } });
    const allGenres = media.flatMap((m) => m.genres);
    return [...new Set(allGenres)].sort();
  },

  async getPlatforms() {
    const media = await prisma.media.findMany({
      select: { streamingPlatforms: true },
    });
    const allPlatforms = media.flatMap((m) => m.streamingPlatforms);
    return [...new Set(allPlatforms)].sort();
  },
};
