# AuthFlow - PAIC Testing CLI Tool

## Project Overview

AuthFlow is a comprehensive CLI testing tool for Ping Identity Advanced Identity Cloud (PAIC). It provides a unified interface for various PAIC testing scenarios including authentication journeys, token management, API testing, and more.

## Vision & Scope

This tool is designed to be the **go-to CLI for PAIC testing** with an extensible architecture to support:
- Authentication journey testing
- JWT token generation and management  
- API endpoint testing
- Configuration validation
- Performance testing
- Security testing
- Administrative operations
- And many more PAIC-related testing scenarios

## Current Status

- **Version**: 0.1.0
- **Architecture**: TypeScript-based CLI with Commander.js
- **Journey Migration**: ✅ **COMPLETED** - Topic-based command structure implemented
- **Token Integration**: ✅ **COMPLETED** - `authflow token get` command fully functional
- **Current Focus**: API testing functionality integration
- **Next Goal**: Add `authflow api` command group for endpoint testing

## Tech Stack

### Core Technologies
- **Language**: TypeScript/Node.js (for cross-platform binary distribution)
- **CLI Framework**: Commander.js (supports unlimited sub-commands)
- **HTTP Client**: Axios
- **Configuration**: YAML/JSON parsing
- **Logging**: Custom logger with colored output
- **Testing**: Jest
- **Build**: TypeScript + pkg for single-binary distribution

### Key Dependencies
```json
{
  "runtime": ["axios", "chalk", "commander", "js-yaml"],
  "dev": ["typescript", "jest", "pkg", "eslint", "prettier"]
}
```

## Architecture Philosophy

### Extensible Command Structure
```
authflow <topic> <action> [options]

Current Implementation:
  authflow version                    # Universal version command
  authflow journey run <file>         # Execute authentication journey  
  authflow journey validate <file>    # Validate journey configuration
  authflow token get -C <config>      # Generate JWT/access tokens ✅ IMPLEMENTED

Planned Topic-Based Structure:
  authflow journey list       # List available journeys
  authflow journey debug      # Debug journey step-by-step

  authflow token refresh      # Refresh existing tokens  
  authflow token validate     # Validate token structure
  authflow token decode       # Decode and inspect tokens

  authflow api test           # Test API endpoints
  authflow api health         # Health check endpoints
  authflow api benchmark      # Performance test APIs

  authflow config validate    # Validate configurations
  authflow config migrate     # Migrate config formats
  authflow config backup      # Backup configurations

  authflow realm info         # Realm information
  authflow realm health       # Realm health checks
  authflow realm migrate      # Realm migration tools
  
  ... and many more topics
```

### Modular Design
- Each topic has its own command group in `src/cli/commands/`
- Topic-based structure: `src/cli/commands/journey/`, `src/cli/commands/token/`, etc.
- Shared functionality in `src/core/` and `src/utils/`
- Type definitions in `src/types/`
- Clear separation of concerns for maintainability

## Configuration Standards

### File Format Standardization
- **YAML for all configs**: Consistent format across all command topics
- **JWK Handling**: JWK objects stored as JSON strings within YAML for copy-paste convenience
- **Config Location**: Topic-organized in `configs/<topic>/examples/` and `configs/<topic>/real/`
- **Security**: All `configs/*/real/` directories are gitignored for safety

### Token Config Format (YAML)
```yaml
service_account_id: "your-service-account-id-here"
jwk_json: '{"kty":"RSA","use":"sig","kid":"abc123","n":"long-base64...","e":"AQAB"}'
platform: "https://your-forgerock-platform.com"
scope: "fr:am:* fr:idm:*"
exp_seconds: 899
proxy: null
verbose: false
output_format: "token"  # token | bearer | json
verify_ssl: true  # true (secure) or false (disable SSL verification)
```

**Design Rationale**: JWK as JSON string enables copy-paste workflow while maintaining YAML consistency across all configs.

## Development Rules & Architecture Principles

### Core Architecture Rules
1. **Service-First Design**: CLI commands are thin wrappers around reusable core services
2. **Internal API Design**: All services must support both CLI usage and internal consumption
3. **Extensibility First**: Design for easy addition of new sub-commands and cross-command integration
4. **TypeScript Everywhere**: All code in TypeScript for type safety and tooling
5. **Cross-Platform**: Single binary works on Windows, macOS, Linux

### Service Reusability Patterns
- **Core Services**: Located in `src/core/` - designed for internal consumption
- **CLI Commands**: Located in `src/cli/commands/` - thin wrappers around core services  
- **Cross-Command Usage**: Commands can leverage other services (e.g., API testing needs TokenService)
- **Flexible Config Support**: Services accept both file paths and programmatic config objects

### Example Internal Usage Flow
```typescript
// Core reusable service
class TokenService {
  async getAccessToken(config: TokenConfig): Promise<string>  // Internal API
}

// CLI wrapper
authflow token get config.yaml  // Calls TokenService.getAccessToken()

// Internal usage by other commands  
authflow api test endpoints.yaml  // Internally uses TokenService for auth
authflow journey run journey.yaml  // May need TokenService for authenticated flows
```

### Additional Rules
6. **Consistent UX**: All sub-commands follow same patterns and conventions
7. **Testable**: Comprehensive test coverage for reliability
8. **Configurable**: Support various config formats and sources
9. **Secure**: Never expose or log sensitive credentials
10. **Composable**: Design services to work together seamlessly

## Project Structure

```
authflow/
├── src/
│   ├── core/                     # 🎯 Core Business Logic (Service Layer)
│   │   ├── services/             # Reusable business services
│   │   │   ├── TokenService.ts   # JWT creation, token exchange
│   │   │   ├── APIService.ts     # PAIC API interactions  
│   │   │   ├── ConfigService.ts  # Configuration parsing
│   │   │   └── [future-services/]
│   │   ├── types/                # TypeScript interfaces & types
│   │   │   ├── token.ts         # Token-related types
│   │   │   ├── config.ts        # Config types
│   │   │   └── api.ts           # API response types
│   │   └── utils/                # Core utility functions
│   │       ├── http.ts          # HTTP client utilities
│   │       ├── crypto.ts        # Cryptographic utilities
│   │       └── logger.ts        # Logging utilities
│   │
│   ├── cli/                      # 🖥️ CLI Interface Layer (Thin Wrappers)
│   │   ├── authflow.ts           # Main CLI entry point
│   │   ├── commands/             # Topic-based command groups
│   │   │   ├── token/            # Token command wrappers
│   │   │   │   ├── index.ts     # Token command group
│   │   │   │   └── get.ts       # CLI wrapper for TokenService
│   │   │   ├── journey/          # Journey command wrappers (legacy)
│   │   │   ├── version.ts        # Universal version command
│   │   │   └── [future-topics/]
│   │   └── wrappers/             # Shared CLI wrapper utilities
│   │       ├── BaseCommand.ts   # Base command class
│   │       └── OutputFormatter.ts # Output formatting
│   │
├── configs/                      # 📁 Configuration Files
│   ├── token/
│   │   ├── examples/            # Token config examples
│   │   └── real/               # Real token configs (gitignored)
│   ├── journey/
│   │   ├── examples/           # Journey config examples  
│   │   └── real/              # Real journey configs (gitignored)
│   └── [future-topics/]
│
├── tests/                        # 🧪 Test Suite
│   ├── core/                    # Core service tests
│   │   └── services/
│   └── cli/                     # CLI wrapper tests
├── examples/                     # Legacy examples & reference tools
└── dist/                        # Compiled JavaScript output
```

### Architecture Flow
```
CLI Commands (External API) → Core Services (Internal API) → External Systems
     ↓                              ↓                           ↓
authflow token get              TokenService              ForgeRock PAIC
authflow api test          →    APIService           →    REST Endpoints  
authflow journey run            ConfigService             YAML Configs
```

## Build & Distribution

- `npm run build:all` - Creates binaries for all platforms
- Single executable deployment to enterprise environments
- No runtime dependencies required on target systems

## Migration Strategy

1. **Foundation**: Establish CLAUDE.md and project structure ✅
2. **Reorganization**: Topic-based config structure and command groups ✅  
3. **Journey Migration**: Move to `authflow journey` command group ✅
4. **Token Integration**: Add `authflow token` command group ✅ **COMPLETED**
5. **API Integration**: Add `authflow api` command group (current)
6. **Expansion**: Continue adding PAIC testing capabilities
7. **Optimization**: Performance and UX improvements

## Future Topics & Actions (Roadmap)

### Token Topic
- `authflow token get` - Generate JWT/access tokens ✅ **IMPLEMENTED**
- `authflow token refresh` - Refresh existing tokens
- `authflow token validate` - Validate token structure
- `authflow token decode` - Decode and inspect tokens

### API Topic  
- `authflow api test` - Test API endpoints
- `authflow api health` - Health check endpoints
- `authflow api benchmark` - Performance testing

### Config Topic
- `authflow config validate` - Validate configurations
- `authflow config migrate` - Migrate config formats
- `authflow config backup` - Backup configurations

### Realm Topic
- `authflow realm info` - Realm information and details
- `authflow realm health` - Realm health checks
- `authflow realm migrate` - Realm migration tools

### Future Topics
- `security` - Security scanning and vulnerability testing
- `monitor` - Real-time monitoring and alerting  
- `performance` - Load testing and benchmarking
- `admin` - Administrative operations

## Notes for Claude

- **Scope**: This is a comprehensive PAIC testing platform, not just journey testing
- **Growth**: Expect many new sub-commands to be added over time
- **Enterprise Focus**: Tool will be used in enterprise environments requiring reliability
- **Security**: Always defensive security focus - testing, not attacking
- **Binary Distribution**: Critical for enterprise deployment without Node.js dependencies