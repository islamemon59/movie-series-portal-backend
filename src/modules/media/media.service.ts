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

    const needsComputedSort = sort === "rating" || sort === "most-reviewed";
    const needsComputedFilter = Boolean(ratingMin);
    const orderBy: Prisma.MediaOrderByWithRelationInput =
      sort === "oldest"
        ? { createdAt: "asc" }
        : sort === "title"
          ? { title: "asc" }
          : { createdAt: "desc" };

    const rawData = await prisma.media.findMany({
      where,
      orderBy,
      ...(needsComputedSort || needsComputedFilter
        ? {}
        : {
            skip: (page - 1) * limit,
            take: limit,
          }),
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
    });

    const mediaWithRating = rawData.map((item) => {
      const ratings = item.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;
      const { reviews: _reviews, ...rest } = item;
      return { ...rest, avgRating: Math.round(avgRating * 10) / 10 };
    });

    let filtered = mediaWithRating;
    if (ratingMin) {
      filtered = mediaWithRating.filter((m) => m.avgRating >= ratingMin);
    }

    if (sort === "rating") {
      filtered = filtered.sort((a, b) => b.avgRating - a.avgRating);
    } else if (sort === "most-reviewed") {
      filtered = filtered.sort((a, b) => b._count.reviews - a._count.reviews);
    }

    const total =
      needsComputedSort || needsComputedFilter
        ? filtered.length
        : await prisma.media.count({ where });
    const paginated =
      needsComputedSort || needsComputedFilter
        ? filtered.slice((page - 1) * limit, page * limit)
        : filtered;

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

  async getSuggestions(query: string, limit = 6) {
    if (!query.trim()) return [];

    const normalizedQuery = query.trim().toLowerCase();
    const media = await prisma.media.findMany({
      take: 30,
      include: {
        reviews: {
          where: { status: "PUBLISHED" },
          select: { rating: true },
        },
        _count: {
          select: { reviews: { where: { status: "PUBLISHED" } } },
        },
      },
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { director: { contains: query, mode: "insensitive" } },
          { cast: { hasSome: [query] } },
          { genres: { hasSome: [query] } },
        ],
      },
    });

    return media
      .map((item) => {
        const ratings = item.reviews.map((r) => r.rating);
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;
        const haystack = [
          item.title,
          item.director,
          ...item.cast,
          ...item.genres,
        ].join(" ").toLowerCase();
        const titleMatch = item.title.toLowerCase().startsWith(normalizedQuery);
        const score =
          (titleMatch ? 40 : 0) +
          (haystack.includes(normalizedQuery) ? 20 : 0) +
          avgRating * 3 +
          item._count.reviews;

        return {
          id: item.id,
          title: item.title,
          subtitle: `${item.type} • ${item.releaseYear} • ${item.director}`,
          posterUrl: item.posterUrl,
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  async getRecommendations(userId?: string) {
    const catalogue = await prisma.media.findMany({
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
    });

    const normalized = catalogue.map((item) => {
      const ratings = item.reviews.map((review) => review.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;
      const { reviews: _reviews, ...rest } = item;
      return { ...rest, avgRating: Math.round(avgRating * 10) / 10 };
    });

    if (!userId) {
      return normalized
        .sort(
          (a, b) =>
            b.avgRating * 3 +
            b._count.watchlistItems -
            (a.avgRating * 3 + a._count.watchlistItems),
        )
        .slice(0, 8)
        .map((item) => ({
          ...item,
          recommendationReason: "Trending across MovieHub this week",
        }));
    }

    const [watchlist, reviews] = await Promise.all([
      prisma.watchlist.findMany({
        where: { userId },
        include: { media: true },
      }),
      prisma.review.findMany({
        where: { userId },
        include: { media: true },
      }),
    ]);

    const interactedMediaIds = new Set<string>();
    const genreWeights = new Map<string, number>();
    const platformWeights = new Map<string, number>();
    const directorWeights = new Map<string, number>();

    const applyWeight = (
      target: Map<string, number>,
      key: string,
      value: number,
    ) => {
      target.set(key, (target.get(key) ?? 0) + value);
    };

    watchlist.forEach(({ media }) => {
      interactedMediaIds.add(media.id);
      media.genres.forEach((genre) => applyWeight(genreWeights, genre, 2));
      media.streamingPlatforms.forEach((platform) =>
        applyWeight(platformWeights, platform, 1),
      );
      applyWeight(directorWeights, media.director, 1.5);
    });

    reviews.forEach(({ media, rating }) => {
      interactedMediaIds.add(media.id);
      const boost = rating >= 8 ? 4 : rating >= 6 ? 2 : 0.5;
      media.genres.forEach((genre) => applyWeight(genreWeights, genre, boost));
      media.streamingPlatforms.forEach((platform) =>
        applyWeight(platformWeights, platform, boost / 2),
      );
      applyWeight(directorWeights, media.director, boost);
    });

    const personalized = normalized
      .filter((item) => !interactedMediaIds.has(item.id))
      .map((item) => {
        const genreScore = item.genres.reduce(
          (sum, genre) => sum + (genreWeights.get(genre) ?? 0),
          0,
        );
        const platformScore = item.streamingPlatforms.reduce(
          (sum, platform) => sum + (platformWeights.get(platform) ?? 0),
          0,
        );
        const directorScore = directorWeights.get(item.director) ?? 0;
        const engagementScore = item.avgRating * 2 + item._count.watchlistItems;
        const totalScore =
          genreScore * 3 + platformScore * 1.5 + directorScore * 2 + engagementScore;

        const strongestGenre = item.genres.find((genre) => genreWeights.has(genre));
        const recommendationReason = strongestGenre
          ? `Because you keep exploring ${strongestGenre} stories`
          : directorScore > 0
            ? `Because you enjoy films from ${item.director}`
            : "Recommended from your recent watchlist activity";

        return {
          ...item,
          totalScore,
          recommendationReason,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 8);

    if (personalized.length > 0) {
      return personalized;
    }

    return normalized
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 8)
      .map((item) => ({
        ...item,
        recommendationReason: "Based on the highest-rated picks on MovieHub",
      }));
  },
};
