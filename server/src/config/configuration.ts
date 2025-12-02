export default () => ({
  app: {
    port: parseInt(process.env.PORT || "3000", 10),
    frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    nodeEnv: process.env.NODE_ENV || "development",
  },
  database: {
    url: process.env.DATABASE_URL || "",
  },
  auth: {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "",
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    ttlSeconds: parseInt(process.env.REDIS_CACHE_TTL_SECONDS || "3600", 10),
  },
});
