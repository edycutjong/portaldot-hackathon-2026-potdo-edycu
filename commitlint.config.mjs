export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Enforce lowercase type (feat, fix, chore, etc.)
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation
        "style", // Formatting (no logic change)
        "refactor", // Code restructuring
        "perf", // Performance improvement
        "test", // Adding/updating tests
        "build", // Build system / dependencies
        "ci", // CI/CD configuration
        "chore", // Maintenance tasks
        "revert", // Revert a commit
      ],
    ],
    // Keep subject concise
    "subject-max-length": [1, "always", 100],
  },
};
