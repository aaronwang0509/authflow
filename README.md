# AuthFlow CLI

A comprehensive command-line tool for testing and interacting with Ping Identity Advanced Identity Cloud (PAIC). AuthFlow provides a unified interface for authentication journeys, JWT token management, API testing, and more.

## Quick Start

### Download & Install

Download the latest binary for your platform from the releases page or build from source:

```bash
# Build from source
npm install
npm run build:all

# Use the binary
./build/authflow --help
```

### Basic Usage

```bash
# Show available commands
authflow --help

# Check version
authflow version

# Get help for specific topics
authflow journey --help
authflow token --help
```

## Commands

### Authentication Journeys

Test PAIC authentication journeys using YAML configuration files.

```bash
# Run an authentication journey
authflow journey run configs/journey/examples/simple-login.yaml

# Validate a journey configuration
authflow journey validate configs/journey/examples/simple-login.yaml
```

**Journey Config Example:**
```yaml
platform: "https://your-paic-tenant.com"
realm: "alpha"
service: "Login"
username: "testuser"
password: "testpass"
steps:
  - name: "Username"
    type: "input"
    value: "testuser"
  - name: "Password"
    type: "input"
    value: "testpass"
```

### JWT Token Management

Generate and manage JWT tokens for PAIC service accounts.

```bash
# Generate an access token
authflow token get -C configs/token/real/service-account.yaml

# Verbose output
authflow token get -C configs/token/real/service-account.yaml --verbose
```

**Token Config Example:**
```yaml
service_account_id: "your-service-account-id"
jwk_json: '{"kty":"RSA","use":"sig","kid":"your-key-id","n":"your-modulus","e":"AQAB","d":"your-private-exponent","p":"prime1","q":"prime2","dp":"dp","dq":"dq","qi":"qi"}'
platform: "https://your-paic-tenant.com"
scope: "fr:am:* fr:idm:*"
exp_seconds: 899
output_format: "token"  # token | bearer | json
verify_ssl: true
```

#### Output Formats

- `token`: Raw JWT token (default)
- `bearer`: `Bearer <token>` format for Authorization headers
- `json`: Full token response as JSON

## Configuration

### Directory Structure

AuthFlow uses a topic-based configuration structure:

```
configs/
├── journey/
│   ├── examples/     # Example configurations
│   └── real/         # Your actual configurations (gitignored)
└── token/
    ├── examples/     # Example configurations
    └── real/         # Your actual configurations (gitignored)
```

### Security Best Practices

1. **Never commit real credentials** - Store actual configurations in `configs/*/real/` directories (gitignored)
2. **Use examples as templates** - Copy from `configs/*/examples/` to `configs/*/real/` and modify
3. **Secure JWK storage** - Keep private keys secure and rotate regularly
4. **SSL verification** - Keep `verify_ssl: true` unless testing against development environments

## Examples

### Generate Service Account Token

1. Copy the example config:
```bash
cp configs/token/examples/service-account.yaml configs/token/real/my-service.yaml
```

2. Edit with your credentials:
```yaml
service_account_id: "your-actual-service-account-id"
jwk_json: '{"kty":"RSA","use":"sig","kid":"your-key-id",...}'
platform: "https://your-tenant.forgeblocks.com"
```

3. Generate token:
```bash
authflow token get -C configs/token/real/my-service.yaml
```

### Test Authentication Journey

1. Copy the example config:
```bash
cp configs/journey/examples/simple-login.yaml configs/journey/real/my-test.yaml
```

2. Edit with your environment details:
```yaml
platform: "https://your-tenant.forgeblocks.com"
realm: "your-realm"
service: "YourJourneyName"
```

3. Run the journey:
```bash
authflow journey run configs/journey/real/my-test.yaml
```

## Troubleshooting

### Common Issues

**"Config file not found"**
- Ensure the file path is correct
- Use absolute paths or paths relative to current directory

**"Expected 'jwk.p' to be a String"**
- Your JWK is missing required RSA private key components
- Ensure your JWK includes: n, e, d, p, q, dp, dq, qi

**SSL Certificate Errors**
- For development: Set `verify_ssl: false` in config
- For production: Ensure valid SSL certificates

**Token Validation Errors**
- Check service account is properly configured in PAIC
- Verify scopes match your service account permissions
- Ensure platform URL is correct

### Verbose Logging

Add `--verbose` flag to any command for detailed logging:

```bash
authflow token get -C config.yaml --verbose
authflow journey run journey.yaml --verbose
```

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Create binaries for all platforms
npm run build:all

# Run tests
npm test

# Development mode
npm run dev -- token get -C config.yaml
```

### Binary Locations

After building, binaries are available in `build/`:
- `authflow` - Default binary for current platform
- `authflow-macos-arm64` - macOS ARM64 (Apple Silicon)
- `authflow-macos-x64` - macOS Intel
- `authflow-linux-x64` - Linux x64
- `authflow-win-x64.exe` - Windows x64

## Support

For issues, questions, or feature requests:

1. Check the troubleshooting section above
2. Review example configurations in `configs/*/examples/`
3. Use `--verbose` flag for detailed error information
4. Create an issue in the project repository

## License

ISC License - See LICENSE file for details.