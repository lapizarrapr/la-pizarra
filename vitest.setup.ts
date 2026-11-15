// Integration test setup: load .env, then point Payload at the test database
// so automated tests never touch development content.
import 'dotenv/config'

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
}
