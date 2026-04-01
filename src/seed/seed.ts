import { prisma } from "../lib/prisma.js";
import { auth } from "../lib/auth.js";

async function seed() {
  console.log("🌱 Starting database seed...");

  // Clean existing data
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.media.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleaned existing data");

  // Create admin user via Better Auth API
  try {
    await auth.api.signUpEmail({
      body: {
        name: "Admin User",
        email: "admin@moviehub.com",
        password: "Admin@123456",
      },
    });

    await prisma.user.update({
      where: { email: "admin@moviehub.com" },
      data: { role: "ADMIN" },
    });

    console.log("✅ Admin user created (admin@moviehub.com / Admin@123456)");
  } catch (error) {
    console.log("⚠️  Admin user may already exist, skipping...");
  }

  // Create sample media
  const mediaData = [
    {
      title: "The Shawshank Redemption",
      synopsis:
        "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      type: "MOVIE" as const,
      genres: ["Drama", "Crime"],
      releaseYear: 1994,
      director: "Frank Darabont",
      cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
      streamingPlatforms: ["Netflix", "Amazon Prime"],
      posterUrl:
        "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=6hB3S9bIaco",
      pricing: "FREE" as const,
      featured: true,
    },
    {
      title: "The Dark Knight",
      synopsis:
        "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
      type: "MOVIE" as const,
      genres: ["Action", "Drama", "Crime"],
      releaseYear: 2008,
      director: "Christopher Nolan",
      cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
      streamingPlatforms: ["HBO Max", "Amazon Prime"],
      posterUrl:
        "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BTUgMe1nNaD.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
      pricing: "FREE" as const,
      featured: true,
    },
    {
      title: "Inception",
      synopsis:
        "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      type: "MOVIE" as const,
      genres: ["Action", "Sci-Fi", "Thriller"],
      releaseYear: 2010,
      director: "Christopher Nolan",
      cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
      streamingPlatforms: ["Netflix", "HBO Max"],
      posterUrl:
        "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      pricing: "PREMIUM" as const,
      featured: true,
    },
    {
      title: "Breaking Bad",
      synopsis:
        "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
      type: "SERIES" as const,
      genres: ["Drama", "Crime", "Thriller"],
      releaseYear: 2008,
      director: "Vince Gilligan",
      cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"],
      streamingPlatforms: ["Netflix"],
      posterUrl:
        "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=HhesaQXLuRY",
      pricing: "FREE" as const,
      featured: true,
    },
    {
      title: "Stranger Things",
      synopsis:
        "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
      type: "SERIES" as const,
      genres: ["Drama", "Fantasy", "Horror"],
      releaseYear: 2016,
      director: "The Duffer Brothers",
      cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder"],
      streamingPlatforms: ["Netflix"],
      posterUrl:
        "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=b9EkMc79ZSU",
      pricing: "PREMIUM" as const,
      featured: true,
    },
    {
      title: "Interstellar",
      synopsis:
        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      type: "MOVIE" as const,
      genres: ["Adventure", "Drama", "Sci-Fi"],
      releaseYear: 2014,
      director: "Christopher Nolan",
      cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
      streamingPlatforms: ["Amazon Prime", "Paramount+"],
      posterUrl:
        "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      pricing: "FREE" as const,
      featured: false,
    },
    {
      title: "The Crown",
      synopsis:
        "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the twentieth century.",
      type: "SERIES" as const,
      genres: ["Drama", "History", "Biography"],
      releaseYear: 2016,
      director: "Peter Morgan",
      cast: ["Claire Foy", "Olivia Colman", "Imelda Staunton"],
      streamingPlatforms: ["Netflix"],
      posterUrl:
        "https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=JWtnJjn6ng0",
      pricing: "PREMIUM" as const,
      featured: false,
    },
    {
      title: "Parasite",
      synopsis:
        "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
      type: "MOVIE" as const,
      genres: ["Drama", "Thriller", "Comedy"],
      releaseYear: 2019,
      director: "Bong Joon-ho",
      cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"],
      streamingPlatforms: ["Hulu", "Amazon Prime"],
      posterUrl:
        "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=5xH0HfJHsaY",
      pricing: "FREE" as const,
      featured: true,
    },
    {
      title: "The Mandalorian",
      synopsis:
        "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
      type: "SERIES" as const,
      genres: ["Action", "Adventure", "Sci-Fi"],
      releaseYear: 2019,
      director: "Jon Favreau",
      cast: ["Pedro Pascal", "Carl Weathers", "Giancarlo Esposito"],
      streamingPlatforms: ["Disney+"],
      posterUrl:
        "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=aOC8E8z_ifw",
      pricing: "PREMIUM" as const,
      featured: true,
    },
    {
      title: "Dune",
      synopsis:
        "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset in the galaxy.",
      type: "MOVIE" as const,
      genres: ["Action", "Adventure", "Sci-Fi"],
      releaseYear: 2021,
      director: "Denis Villeneuve",
      cast: ["Timothée Chalamet", "Rebecca Ferguson", "Zendaya"],
      streamingPlatforms: ["HBO Max", "Amazon Prime"],
      posterUrl:
        "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=8g18jFHCLXk",
      pricing: "FREE" as const,
      featured: false,
    },
    {
      title: "Wednesday",
      synopsis:
        "Follows Wednesday Addams' years as a student, when she attempts to master her emerging psychic ability, thwart a killing spree, and solve the mystery.",
      type: "SERIES" as const,
      genres: ["Comedy", "Crime", "Fantasy"],
      releaseYear: 2022,
      director: "Tim Burton",
      cast: ["Jenna Ortega", "Gwendoline Christie", "Riki Lindhome"],
      streamingPlatforms: ["Netflix"],
      posterUrl:
        "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=Di310WS8zLk",
      pricing: "PREMIUM" as const,
      featured: false,
    },
    {
      title: "Oppenheimer",
      synopsis:
        "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
      type: "MOVIE" as const,
      genres: ["Biography", "Drama", "History"],
      releaseYear: 2023,
      director: "Christopher Nolan",
      cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
      streamingPlatforms: ["Amazon Prime"],
      posterUrl:
        "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
      pricing: "FREE" as const,
      featured: true,
    },
  ];

  await prisma.media.createMany({ data: mediaData });
  console.log(`✅ Created ${mediaData.length} media entries`);

  console.log("\n🎉 Seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin credentials:");
  console.log("  Email:    admin@moviehub.com");
  console.log("  Password: Admin@123456");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
