import sinon from "sinon";

// Set test env vars
process.env.SECRET_KEY = "test-secret-key-for-unit-tests";
process.env.NODE_ENV = "test";
process.env.EMAIL_USER = "test@test.com";
process.env.EMAIL_PASSWORD = "testpass";

afterEach(() => {
  sinon.restore();
});
