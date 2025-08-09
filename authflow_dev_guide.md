
# AuthFlow CLI Tool - Dev Guide

## Tool Name: `authflow`

A CLI tool to simulate and test ForgeRock/Ping Identity Cloud authentication journeys using YAML configuration files and REST API calls.

---

## Key Features

- Run end-to-end tests of any authentication journey using REST
- Accept human-friendly YAML files for inputs
- Auto match step-by-step callbacks using prompts
- Support time intervals, step-by-step or full-auto mode
- Export as Postman collection or Python script
- Built-in logging and failure diagnostics

---

## REST API Calling Rules

### 🔁 Step 1: Init Call

**Endpoint**:
```
POST {{platformUrl}}/am/json/realms/root/realms/{{realm}}/authenticate?authIndexType=service&authIndexValue={{journeyName}}
```

**Headers**:
```
Content-Type: application/json
Accept-API-Version: resource=2.0, protocol=1.0
```

**Payload**: none

**Response**: contains first `authId` and a list of `callbacks`.

---

### 🔁 Step 2: Continue Journey

**Endpoint**:
```
POST {{platformUrl}}/am/json/realms/root/realms/{{realm}}/authenticate
```

**Headers**:
```
Content-Type: application/json
Accept-API-Version: resource=2.0, protocol=1.0
```

**Payload Structure**:

```json
{
  "authId": "{{authId_from_last_response}}",
  "callbacks": [
    {
      "type": "...",
      "input": [
        { "name": "IDToken1", "value": "value1" }
      ]
    },
    ...
  ]
}
```

**Repeat this step** until you receive a final response with:
```json
{
  "tokenId": "...",
  "successUrl": "..."
}
```

---

## ✅ Example: 2-Step Journey (Username + Password)

### Step 1: Init Request

```
POST /am/json/realms/root/realms/alpha/authenticate?authIndexType=service&authIndexValue=SimpleLogin
```

**Response:**
```json
{
  "authId": "abc123",
  "callbacks": [
    {
      "type": "NameCallback",
      "output": [{ "name": "prompt", "value": "Username" }],
      "input": [{ "name": "IDToken1", "value": "" }]
    }
  ]
}
```

### Step 2: Submit Username

**Request:**
```json
{
  "authId": "abc123",
  "callbacks": [
    {
      "type": "NameCallback",
      "input": [{ "name": "IDToken1", "value": "aaron.wang" }]
    }
  ]
}
```

**Response:**
```json
{
  "authId": "def456",
  "callbacks": [
    {
      "type": "PasswordCallback",
      "output": [{ "name": "prompt", "value": "Password" }],
      "input": [{ "name": "IDToken2", "value": "" }]
    }
  ]
}
```

### Step 3: Submit Password

**Request:**
```json
{
  "authId": "def456",
  "callbacks": [
    {
      "type": "PasswordCallback",
      "input": [{ "name": "IDToken2", "value": "MySecret123" }]
    }
  ]
}
```

**Final Response:**
```json
{
  "tokenId": "eyJraWQi...",
  "successUrl": "/enduser/?realm=alpha"
}
```

---

## YAML Sample for Above Journey

```yaml
platformUrl: https://openam.example.com
realm: alpha
journeyName: SimpleLogin

steps:
  step1:
    IDToken1: aaron.wang

  step2:
    IDToken2: MySecret123
```

---

## Error Handling

- 4xx (e.g., 401, 403): invalid credentials or access denied
- 5xx: journey broken or server error
- Callback validation: mismatch on expected prompts (if enabled)

---

## Tech Stack & Architecture

### Technology Choice: **TypeScript**
- **Full-stack coherence**: Same language for web apps, APIs, and CLI tools
- **Modern tooling**: Excellent IDE support, type safety, npm ecosystem
- **Distribution**: Single binary via `pkg` or `bun compile`
- **Performance**: Good startup time, extensive HTTP/YAML libraries

### Project Structure
```
authflow/
├── src/
│   ├── cli/               # CLI entry points & commands
│   │   ├── index.ts       # Main CLI entry
│   │   └── commands/      # Individual commands
│   │       ├── run.ts     # authflow run
│   │       ├── step.ts    # authflow step  
│   │       └── validate.ts # authflow validate
│   │
│   ├── core/              # Business logic (loose coupled)
│   │   ├── journey.ts     # Journey execution engine
│   │   ├── api-client.ts  # ForgeRock API calls
│   │   └── config.ts      # YAML parsing & validation
│   │
│   ├── types/             # TypeScript definitions
│   │   ├── journey.ts     # Journey, Step, Callback types
│   │   ├── api.ts         # API request/response types
│   │   └── config.ts      # YAML config types
│   │
│   └── utils/             # Utilities
│       ├── logger.ts      # Logging
│       ├── http.ts        # HTTP client wrapper
│       └── file.ts        # File operations
│
├── tests/                 # Test files mirror src/
├── examples/              # Sample YAML files
└── dist/                  # Compiled output
```

### Key Dependencies
- **commander**: CLI framework
- **axios**: HTTP client
- **js-yaml**: YAML parsing
- **chalk**: Terminal colors
- **jest**: Testing framework

---

## Development Strategy

### Iterative Approach
Build minimal runnable functionality first, then add features incrementally with testing.

### Conditional Flow Handling
- Each YAML file represents one deterministic path through a journey
- Complex conditional journeys = multiple YAML files for different scenarios
- Fixed input values ensure predictable, testable outcomes
- One YAML = one specific route, easy to debug

## 🎯 Step-by-Step Development Plan

### **Phase 1: MVP Foundation (Next 3-4 iterations)**
1. **Install dependencies & test basic structure**
   - Run `npm install`, verify TypeScript compilation
   - Test basic CLI structure with `--help`

2. **Implement basic YAML loading & validation**
   - Complete file utilities and config parser
   - Add comprehensive YAML validation

3. **Add simple HTTP client with ForgeRock API calls**
   - Implement init and continue API calls
   - Basic error handling and logging

4. **Create minimal journey runner (no smart callback matching)**
   - Simple input name matching (IDToken1, IDToken2, etc.)
   - End-to-end journey execution

### **Phase 2: Core Functionality (Next 4-5 iterations)**
5. **Add intelligent callback matching by prompt text**
   - Match YAML prompts to API callback prompts
   - Flexible input handling

6. **Implement step-by-step execution mode**
   - `authflow step` command implementation
   - Interactive debugging capabilities

7. **Add better error handling & recovery**
   - Retry strategies, timeout handling
   - Detailed error diagnostics

8. **Comprehensive testing suite**
   - Unit tests for all modules
   - Integration tests with mock API responses

### **Phase 3: Polish & Extensions (Future iterations)**
9. **Export functionality (Postman/Python)**
   - Convert working journeys to other formats
   - Code generation capabilities

10. **Response recording & playback**
    - Save/replay API responses for testing
    - Offline development mode

11. **Advanced validation & retry strategies**
    - Smart prompt validation
    - Auto-retry on common errors

12. **Performance optimizations**
    - Binary compilation for distribution
    - Parallel execution capabilities

---

## Development Commands

### NPM Scripts
```bash
# Development
npm install                    # Install dependencies
npm run dev -- --help        # Run CLI in development mode with TypeScript
npm run dev -- run examples/simple-login.yaml  # Test with example journey
npm run dev -- run your-journey.yaml --step --verbose  # Interactive debug mode

# Building
npm run build                 # Compile TypeScript to JavaScript (dist/)
npm run start -- --help      # Run compiled JavaScript version

# Binary Creation
npm run build:binary          # Create single binary → build/authflow
npm run build:mac-arm         # Create macOS ARM64 binary → build/authflow
npm run build:all             # Create all platform binaries → build/authflow-*

# Testing & Quality
npm test                      # Run tests
npm run test:watch           # Run tests in watch mode
npm run lint                 # Check code style
npm run format               # Auto-format code
```

### Binary Usage
```bash
# After npm run build:mac-arm
./build/authflow --help
./build/authflow -v
./build/authflow run examples/simple-login.yaml
./build/authflow run your-journey.yaml --step
./build/authflow run your-journey.yaml --verbose
./build/authflow validate your-journey.yaml

# After npm run build:all
./build/authflow-macos-arm64 -v     # macOS Apple Silicon
./build/authflow-macos-x64 -v       # macOS Intel
./build/authflow-linux-x64 -v       # Linux x64
./build/authflow-win-x64.exe -v     # Windows x64
```

### CLI Commands Available
```bash
authflow -v                           # Show version
authflow version                      # Show version (command)
authflow run <file>                   # Run journey automatically
authflow run <file> --step            # Interactive step-by-step (default Yes)
authflow run <file> --verbose         # Show full HTTP request/response
authflow run <file> --step --verbose  # Interactive with full details
authflow validate <file>              # Validate YAML config
```

---

## Current Status

✅ **MVP Complete and Functional**
- ✅ Full TypeScript project structure
- ✅ CLI interface with commander.js
- ✅ YAML config parsing and validation
- ✅ ForgeRock API integration (init + continue)
- ✅ End-to-end journey execution
- ✅ Interactive step-by-step mode
- ✅ Verbose HTTP logging
- ✅ Binary compilation for all platforms
- ✅ Comprehensive error handling

🎯 **Ready for Phase 2** - Advanced features and smart callback matching

