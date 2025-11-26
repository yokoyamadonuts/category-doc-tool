# Go Test Template for TDD Workflow

This template demonstrates how to write Go tests following the TDD (Test-Driven Development) workflow with proper traceability annotations.

## Template

```go
package yourpackage_test

import (
	"testing"
	"yourpackage"
)

// TEST-001
// Verifies: REQ-001
// Description: Test description that explains what requirement this test verifies
func TestFeatureName(t *testing.T) {
	// Arrange: Set up test data and dependencies
	// Example:
	// input := "test data"
	// expected := "expected result"

	// Act: Call the function or method being tested
	// Example:
	// actual := yourpackage.YourFunction(input)

	// Assert: Verify the result matches expectations
	// Example:
	// if actual != expected {
	//     t.Errorf("Expected %v, got %v", expected, actual)
	// }

	// RED Phase: This test should FAIL initially because implementation doesn't exist
	t.Fatal("Test not yet implemented")
}

// TEST-002
// Verifies: REQ-002
// Description: Another test for a different requirement
func TestAnotherFeature(t *testing.T) {
	// Follow the same Arrange-Act-Assert pattern
	t.Fatal("Test not yet implemented")
}
```

## Traceability Annotations

### Required Annotations

1. **TEST-ID**: Unique test identifier
   ```go
   // TEST-001
   ```

2. **REQ Reference**: Links test to requirement
   ```go
   // Verifies: REQ-001
   ```
   Alternatively: `// Covers: REQ-001` or `// Tests: REQ-001`

3. **Description**: Brief explanation of what the test verifies
   ```go
   // Description: Test that user authentication succeeds with valid credentials
   ```

### Test Function Naming

- Use descriptive names: `TestUserAuthentication`, `TestDataValidation`
- Follow Go convention: `Test` prefix + PascalCase
- Group related tests: `TestUserLogin`, `TestUserLogout`, `TestUserRegister`

## TDD Workflow Phases

### Gate-A (RED Phase)

1. Write tests that describe the desired behavior
2. Include proper traceability annotations (TEST-ID, REQ reference)
3. Tests should FAIL initially (use `t.Fatal("Not implemented")`)
4. Verify all tests fail: `go test -v`
5. Validate Gate-A: Tests exist and all fail

### Gate-B (GREEN Phase)

1. Implement minimal code to make tests pass
2. Run tests with coverage: `go test -v -coverprofile=coverage.out`
3. Verify all tests pass
4. Ensure coverage meets threshold (default 80%)
5. Validate Gate-B: All tests pass with sufficient coverage

### Gate-C (REFACTOR Phase)

1. Refactor code to improve quality
2. Add implementation annotations:
   ```go
   // Implements: REQ-001
   func YourFunction() {
       // implementation
   }
   ```
3. Run tests again to ensure they still pass
4. Generate traceability report
5. Validate Gate-C: Tests pass and traceability is complete

## Running Tests

### Basic test run
```bash
go test -v
```

### With coverage
```bash
go test -v -coverprofile=coverage.out
go tool cover -html=coverage.out
```

### Using spec-workflow-mcp
```bash
# Run tests via MCP tool
# run-tests with projectPath, feature, language: "go", testPaths: ["./..."]

# Validate gates
# tdd-gate with gate: "A", action: "validate"
# tdd-gate with gate: "B", action: "validate"
# tdd-gate with gate: "C", action: "validate"

# Generate traceability
# generate-trace with testDir: ".", implDir: ".", language: "go"
```

## Best Practices

1. **One Test Per Requirement**: Each REQ-* should have at least one test
2. **Clear Test Names**: Use descriptive function names
3. **Arrange-Act-Assert**: Follow the AAA pattern
4. **Independent Tests**: Tests should not depend on each other
5. **Fast Tests**: Keep tests quick (< 1 second per test)
6. **Deterministic**: Tests should always produce the same result
7. **Test Edge Cases**: Include boundary conditions and error cases

## Example: Complete Feature Test

```go
package auth_test

import (
	"testing"
	"myapp/auth"
)

// TEST-AUTH-001
// Verifies: REQ-AUTH-001
// Description: User can login with valid credentials
func TestUserLoginSuccess(t *testing.T) {
	// Arrange
	authService := auth.NewService()
	username := "testuser"
	password := "password123"

	// Act
	user, err := authService.Login(username, password)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	if user == nil {
		t.Fatal("Expected user object, got nil")
	}
	if user.Username != username {
		t.Errorf("Expected username %s, got %s", username, user.Username)
	}
}

// TEST-AUTH-002
// Verifies: REQ-AUTH-002
// Description: User cannot login with invalid credentials
func TestUserLoginInvalidCredentials(t *testing.T) {
	// Arrange
	authService := auth.NewService()
	username := "testuser"
	password := "wrongpassword"

	// Act
	user, err := authService.Login(username, password)

	// Assert
	if err == nil {
		t.Fatal("Expected error for invalid credentials, got nil")
	}
	if user != nil {
		t.Fatal("Expected nil user for invalid credentials")
	}
	if err != auth.ErrInvalidCredentials {
		t.Errorf("Expected ErrInvalidCredentials, got %v", err)
	}
}
```
