import { AuthService } from "../services/authService"; // Adjust the path to where your AuthService is located
import jwt from "jsonwebtoken";

// Mocking dotenv config
process.env.JWT_SECRET = "mySecretKey"; // You can set a mock secret key here

describe("AuthService", () => {
  let authService: AuthService;

  beforeAll(() => {
    authService = new AuthService(); // Create an instance of AuthService before tests
  });

  it("should verify a valid token", async () => {
    // Create a valid token using jwt
    const payload = { userId: "12345", username: "testUser" };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    const decoded = await authService.verifyToken(token);

    // Verify the decoded data
    expect(decoded).toHaveProperty("userId", "12345");
    expect(decoded).toHaveProperty("username", "testUser");
  });

  it("should throw an error for an invalid token", async () => {
    const invalidToken = "invalid.token.string";

    try {
      await authService.verifyToken(invalidToken);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      // expect(error.message).toBe("jwt malformed");
    }
  });
});
