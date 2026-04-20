import { config } from "dotenv";
config({ path: ".env" });

// Override admin vars with predictable test values so tests are deterministic
process.env.ADMIN_LOGIN = "test_admin";
process.env.ADMIN_PASSWORD = "test_password_12345";
process.env.ADMIN_SESSION_SECRET = "a".repeat(64);
