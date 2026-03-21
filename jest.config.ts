import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^next-intl$": "<rootDir>/src/__mocks__/next-intl.tsx",
    "^next-intl/navigation$": "<rootDir>/src/__mocks__/next-intl-navigation.tsx",
    "^next-intl/routing$": "<rootDir>/src/__mocks__/next-intl-routing.ts",
    "^next-intl/server$": "<rootDir>/src/__mocks__/next-intl-server.ts",
  },
};

export default createJestConfig(config);
