export default () => ({
  port: Number(process.env.PORT ?? 4000),
  postgres:
    process.env.DATABASE_URL ??
    'postgresql://postgres:password123@postgres:5432/nest?schema=public',
  jwtSecret: process.env.JWT_SECRET ?? 'YOUR JWT SECRET KEY',
});
