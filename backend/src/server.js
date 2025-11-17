const app = require("./app");
const { ensureAdminAccount } = require("./services/adminSeeder");

const PORT = process.env.PORT || 8000;

async function bootstrap() {
  try {
    await ensureAdminAccount();
  } catch (error) {
    console.error("[AdminSeeder] Không thể tạo tài khoản admin mặc định:", error);
  }

  app.listen(PORT, () => console.log("🚀 Server running on port", PORT));
}

bootstrap();
