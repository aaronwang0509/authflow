# AuthFlow CLI - User Guide

> Quick reference for testing ForgeRock/Ping Identity authentication journeys

## Quick Start

```bash
# Install and build
npm install && npm run build

# Test a journey
authflow run examples/simple-login.yaml

# Interactive step-by-step mode
authflow run examples/simple-login.yaml --step

# Full debug output
authflow run examples/simple-login.yaml --verbose
```

---

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `authflow run <file>` | Execute journey automatically | `authflow run my-journey.yaml` |
| `authflow run <file> --step` | Interactive step-by-step | `authflow run my-journey.yaml --step` |
| `authflow run <file> --verbose` | Show full HTTP details | `authflow run my-journey.yaml --verbose` |
| `authflow validate <file>` | Validate YAML config | `authflow validate my-journey.yaml` |
| `authflow version` | Show version | `authflow version` |

---

## YAML Format

```yaml
# Connection details
platformUrl: https://your-forgerock.com
realm: alpha
journeyName: YourJourneyName

# Step inputs (match the order they appear)
steps:
  step1:
    IDToken1: username_value
  
  step2: 
    IDToken2: password_value
    
  step3:
    IDToken3: some_other_input
```

---

## Typical Workflow

1. **Create YAML config** - Define your journey inputs
2. **Validate** - `authflow validate config.yaml`
3. **Test interactively** - `authflow run config.yaml --step`  
4. **Run automatically** - `authflow run config.yaml`
5. **Debug issues** - Add `--verbose` for full HTTP logs

---

## Common Scenarios

### Username/Password Login
```yaml
platformUrl: https://openam.example.com
realm: alpha
journeyName: Login

steps:
  step1:
    IDToken1: john.doe
  step2:
    IDToken2: MyPassword123
```

### Multi-Factor with OTP
```yaml
platformUrl: https://openam.example.com
realm: alpha  
journeyName: MFALogin

steps:
  step1:
    IDToken1: john.doe
  step2:
    IDToken2: MyPassword123
  step3:
    IDToken1: 123456  # OTP code
```

---

## Success Indicators

✅ **Journey Success:**
```json
{
  "tokenId": "eyJraWQi...",
  "successUrl": "/enduser/?realm=alpha"
}
```

❌ **Journey Failure:**
- HTTP 401/403 (invalid credentials)
- HTTP 500 (server error)  
- Callback mismatch errors

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Check `platformUrl` and network |
| "Invalid journey" | Verify `journeyName` exists in realm |
| "Callback mismatch" | Run with `--step` to see expected inputs |
| "Authentication failed" | Check credentials in YAML |
| "Token format invalid" | Check ForgeRock version compatibility |

---

## Development Mode

```bash
# Run without building
npm run dev -- run examples/simple-login.yaml

# Watch mode for development  
npm run test:watch
```

---

## Binary Usage

```bash
# Create binary
npm run build:binary

# Use binary
./build/authflow run examples/simple-login.yaml
```

---

## Tips for Effective Testing

1. **Start simple** - Test basic username/password first
2. **Use --step mode** - Understand callback flow before automating  
3. **Save working configs** - Build library of tested journeys
4. **Use --verbose** - Debug API call issues
5. **Test edge cases** - Invalid credentials, timeouts, etc.

---

## Project Context

- **Purpose**: Test ForgeRock authentication journeys via REST API
- **Input**: Human-friendly YAML configs
- **Output**: Success/failure with detailed logging
- **Use Cases**: CI/CD testing, journey validation, debugging

---

*Ready to eat our own dog food! 🐕🦴*