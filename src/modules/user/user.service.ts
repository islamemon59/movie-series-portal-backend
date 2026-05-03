import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../types/index.js";
import type { UpdateProfileInput } from "./user.schema.js";

export const userService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            reviews: true,
            comments: true,
            watchlist: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  },

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const existing = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: { id: userId },
      },
    });

    if (existing) {
      throw new AppError(409, "Email is already in use");
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        image: data.image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
