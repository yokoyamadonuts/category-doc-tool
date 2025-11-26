# PHP Test Template for TDD Workflow

This template demonstrates how to write PHPUnit tests following the TDD (Test-Driven Development) workflow with proper traceability annotations.

## Template

```php
<?php

namespace Tests\Feature;

use PHPUnit\Framework\TestCase;
use App\YourClass;

class YourFeatureTest extends TestCase
{
    // TEST-001
    // Verifies: REQ-001
    // Description: Test description that explains what requirement this test verifies
    public function testFeatureName(): void
    {
        // Arrange: Set up test data and dependencies
        // Example:
        // $input = 'test data';
        // $expected = 'expected result';

        // Act: Call the method being tested
        // Example:
        // $actual = YourClass::yourMethod($input);

        // Assert: Verify the result matches expectations
        // Example:
        // $this->assertEquals($expected, $actual);

        // RED Phase: This test should FAIL initially because implementation doesn't exist
        $this->fail('Test not yet implemented');
    }

    // TEST-002
    // Verifies: REQ-002
    // Description: Another test for a different requirement
    public function testAnotherFeature(): void
    {
        // Follow the same Arrange-Act-Assert pattern
        $this->fail('Test not yet implemented');
    }
}
```

## Traceability Annotations

### Required Annotations

1. **TEST-ID**: Unique test identifier
   ```php
   // TEST-001
   ```

2. **REQ Reference**: Links test to requirement
   ```php
   // Verifies: REQ-001
   ```
   Alternatively: `// Covers: REQ-001` or `// Tests: REQ-001`

3. **Description**: Brief explanation of what the test verifies
   ```php
   // Description: Test that user authentication succeeds with valid credentials
   ```

### Test Method Naming

- Use descriptive names: `testUserAuthentication`, `testDataValidation`
- Follow PHPUnit convention: `test` prefix + camelCase
- Group related tests in same class: `UserAuthenticationTest`, `DataValidationTest`

## TDD Workflow Phases

### Gate-A (RED Phase)

1. Write tests that describe the desired behavior
2. Include proper traceability annotations (TEST-ID, REQ reference)
3. Tests should FAIL initially (use `$this->fail("Not implemented")`)
4. Verify all tests fail: `phpunit`
5. Validate Gate-A: Tests exist and all fail

### Gate-B (GREEN Phase)

1. Implement minimal code to make tests pass
2. Run tests with coverage: `phpunit --coverage-text`
3. Verify all tests pass
4. Ensure coverage meets threshold (default 80%)
5. Validate Gate-B: All tests pass with sufficient coverage

### Gate-C (REFACTOR Phase)

1. Refactor code to improve quality
2. Add implementation annotations:
   ```php
   // Implements: REQ-001
   public function yourMethod() {
       // implementation
   }
   ```
3. Run tests again to ensure they still pass
4. Generate traceability report
5. Validate Gate-C: Tests pass and traceability is complete

## Running Tests

### Basic test run
```bash
phpunit
```

### With coverage
```bash
phpunit --coverage-text
phpunit --coverage-html coverage/
```

### Specific test
```bash
phpunit tests/Feature/YourFeatureTest.php
```

### Using spec-workflow-mcp
```bash
# Run tests via MCP tool
# run-tests with projectPath, feature, language: "php", testPaths: ["tests/Feature"]

# Validate gates
# tdd-gate with gate: "A", action: "validate"
# tdd-gate with gate: "B", action: "validate"
# tdd-gate with gate: "C", action: "validate"

# Generate traceability
# generate-trace with testDir: "tests", implDir: "app", language: "php"
```

## Best Practices

1. **One Test Per Requirement**: Each REQ-* should have at least one test
2. **Clear Test Names**: Use descriptive method names
3. **Arrange-Act-Assert**: Follow the AAA pattern
4. **Independent Tests**: Tests should not depend on each other
5. **Fast Tests**: Keep tests quick (< 1 second per test)
6. **Use Data Providers**: For testing multiple inputs
7. **Test Edge Cases**: Include boundary conditions and error cases
8. **Clean Up**: Use `setUp()` and `tearDown()` for test fixtures

## PHPUnit Assertions

Common assertions for testing:

```php
// Equality
$this->assertEquals($expected, $actual);
$this->assertSame($expected, $actual); // Strict equality (===)

// Boolean
$this->assertTrue($condition);
$this->assertFalse($condition);

// Null
$this->assertNull($value);
$this->assertNotNull($value);

// Arrays
$this->assertCount($expectedCount, $array);
$this->assertContains($needle, $haystack);
$this->assertArrayHasKey($key, $array);

// Exceptions
$this->expectException(InvalidArgumentException::class);
$this->expectExceptionMessage('Expected message');

// Strings
$this->assertStringContainsString($needle, $haystack);
$this->assertStringStartsWith($prefix, $string);
```

## Example: Complete Feature Test

```php
<?php

namespace Tests\Feature;

use PHPUnit\Framework\TestCase;
use App\Services\AuthService;
use App\Exceptions\InvalidCredentialsException;

class AuthenticationTest extends TestCase
{
    private AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authService = new AuthService();
    }

    // TEST-AUTH-001
    // Verifies: REQ-AUTH-001
    // Description: User can login with valid credentials
    public function testUserLoginSuccess(): void
    {
        // Arrange
        $username = 'testuser';
        $password = 'password123';

        // Act
        $user = $this->authService->login($username, $password);

        // Assert
        $this->assertNotNull($user, 'Expected user object, got null');
        $this->assertEquals($username, $user->getUsername());
        $this->assertTrue($user->isAuthenticated());
    }

    // TEST-AUTH-002
    // Verifies: REQ-AUTH-002
    // Description: User cannot login with invalid credentials
    public function testUserLoginInvalidCredentials(): void
    {
        // Arrange
        $username = 'testuser';
        $password = 'wrongpassword';

        // Assert - expect exception
        $this->expectException(InvalidCredentialsException::class);
        $this->expectExceptionMessage('Invalid username or password');

        // Act
        $this->authService->login($username, $password);
    }

    // TEST-AUTH-003
    // Verifies: REQ-AUTH-003
    // Description: User session is created after successful login
    public function testUserSessionCreatedAfterLogin(): void
    {
        // Arrange
        $username = 'testuser';
        $password = 'password123';

        // Act
        $user = $this->authService->login($username, $password);
        $session = $this->authService->getSession($user->getId());

        // Assert
        $this->assertNotNull($session);
        $this->assertEquals($user->getId(), $session->getUserId());
        $this->assertTrue($session->isActive());
    }
}
```

## Data Provider Example

```php
// TEST-VALIDATE-001
// Verifies: REQ-VALIDATE-001
// Description: Email validation works for various inputs
/**
 * @dataProvider emailProvider
 */
public function testEmailValidation(string $email, bool $expected): void
{
    // Act
    $isValid = $this->validator->validateEmail($email);

    // Assert
    $this->assertEquals($expected, $isValid, "Email: $email");
}

public static function emailProvider(): array
{
    return [
        'valid email' => ['user@example.com', true],
        'invalid - no @' => ['userexample.com', false],
        'invalid - no domain' => ['user@', false],
        'valid - subdomain' => ['user@mail.example.com', true],
        'invalid - spaces' => ['user @example.com', false],
    ];
}
```

## Setup and Teardown

```php
class DatabaseTest extends TestCase
{
    private $connection;

    // Runs before each test
    protected function setUp(): void
    {
        parent::setUp();
        $this->connection = new DatabaseConnection();
        $this->connection->beginTransaction();
    }

    // Runs after each test
    protected function tearDown(): void
    {
        $this->connection->rollback();
        $this->connection->close();
        parent::tearDown();
    }

    // Runs once before all tests in class
    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();
        // Initialize test database
    }

    // Runs once after all tests in class
    public static function tearDownAfterClass(): void
    {
        // Clean up test database
        parent::tearDownAfterClass();
    }
}
```
