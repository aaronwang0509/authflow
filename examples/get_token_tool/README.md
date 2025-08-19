# ForgeRock Service Account Token CLI

A simple command-line tool to get PAIC Service Account access tokens using JSON configuration.

## Features

- Simple configuration via JSON file
- Support for all ForgeRock PAIC platforms
- Multiple output formats (token, bearer, json)
- Cross-platform support (Linux, macOS, Windows)

## Prerequisites

- Python 3.7 or higher
- ForgeRock Service Account credentials (Service Account ID and JWK)

## Installation

### Linux/macOS

1. **Clone or download this tool:**
   ```bash
   # Navigate to the tool directory
   cd get_token_tool
   ```

2. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Windows

1. **Clone or download this tool:**
   ```cmd
   REM Navigate to the tool directory
   cd get_token_tool
   ```

2. **Create a virtual environment:**
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```cmd
   pip install -r requirements.txt
   ```

## Configuration

1. **Copy the example config:**
   ```bash
   cp config.json.example config.json
   ```

2. **Edit config.json with your credentials:**
   ```json
   {
     "service_account_id": "your-service-account-id",
     "jwk_dict": "your-jwk-json",
     "platform": "https://your-forgerock-platform.com",
     "scope": "fr:am:* fr:idm:*",
     "exp_seconds": 899,
     "proxy": null,
     "verbose": false,
     "output_format": "token"
   }
   ```

### Required Fields:
- `service_account_id`: Your ForgeRock Service Account ID
- `jwk_dict`: Your Service Account JWK (JSON Web Key)
- `platform`: Your ForgeRock platform URL
- `scope`: OAuth2 scope (default: "fr:am:* fr:idm:*")
- `exp_seconds`: JWT expiration time in seconds (default: 899)

### Optional Fields:
- `proxy`: HTTPS proxy URL (set to null if not needed)
- `verbose`: Enable verbose output (true/false)
- `output_format`: Output format - "token", "bearer", or "json"

## Usage

### Basic Usage

```bash
python get_token_cli.py -C config.json
```

This will output just the access token:
```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Different Output Formats

**Bearer format:**
```json
{
  "output_format": "bearer"
}
```
Output: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...`

**JSON format:**
```json
{
  "output_format": "json"
}
```
Output: `{"access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...", "token_type": "Bearer"}`

### Verbose Output

Set `"verbose": true` in config.json to see detailed information:
```
✅ Access token retrieved successfully
   Token length: 1234
   Scope: fr:am:* fr:idm:*
   Expires in: 899 seconds
```

## Troubleshooting

### Common Errors

- **"Config file not found"**: Make sure config.json exists in the current directory
- **"Missing required field"**: Check that all required fields are present in config.json
- **"Invalid JSON"**: Validate your JSON syntax using a JSON validator
- **"Failed to get token"**: Check your service account credentials and platform URL

### Getting Service Account Credentials

1. Log into your ForgeRock Admin UI
2. Navigate to Identity Management → Service Accounts
3. Create or select a service account
4. Download the JWK credentials
5. Copy the Service Account ID and JWK data to your config.json

## Security Notes

- Keep your config.json file secure and never commit it to version control
- The JWK contains private key material - treat it as a secret
- Consider using environment variables or secure vaults for production use

## Examples

### Shell Script Integration
```bash
#!/bin/bash
TOKEN=$(python get_token_cli.py -C config.json)
curl -H "Authorization: Bearer $TOKEN" https://api.example.com/data
```

### PowerShell Integration
```powershell
$token = python get_token_cli.py -C config.json
Invoke-RestMethod -Uri "https://api.example.com/data" -Headers @{Authorization="Bearer $token"}
```

## License

MIT License