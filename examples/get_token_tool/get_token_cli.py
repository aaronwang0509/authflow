#!/usr/bin/env python3
"""
CLI version of get_token.py for PAIC Service Account authentication

MIT License

Copyright (c) 2025 Aaron Wang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Author: Aaron Wang
"""
import argparse
import base64
import json
import os
import sys
import time
from typing import Dict, Optional

import requests
import urllib3
from jwcrypto import jwk, jwt

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def create_signed_jwt(
    service_account_id: str,
    aud: str,
    jwk_dict: dict,
    exp_seconds: int = 899
) -> str:
    """
    Create a signed JWT for the ForgeRock Service Account.
    """
    key = jwk.JWK.from_json(json.dumps(jwk_dict))

    exp = int(time.time()) + exp_seconds
    jti = base64.urlsafe_b64encode(os.urandom(16)).decode('utf-8').rstrip('=')

    payload = {
        "iss": service_account_id,
        "sub": service_account_id,
        "aud": aud,
        "exp": exp,
        "jti": jti
    }

    token = jwt.JWT(header={"alg": "RS256"}, claims=payload)
    token.make_signed_token(key)

    return token.serialize()

def get_service_account_access_token(
    platform_url: str,
    service_account_id: str,
    jwk_dict: dict,
    exp_seconds: int = 899,
    scope: str = "fr:am:* fr:idm:*",
    proxy_url: Optional[str] = None,
    verbose: bool = False
) -> str:
    """
    Request a ForgeRock PAIC Access Token using a Service Account JWK.
    """
    aud = platform_url.rstrip("/") + "/am/oauth2/access_token"
    signed_jwt = create_signed_jwt(service_account_id, aud, jwk_dict, exp_seconds)

    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "client_id": "service-account",
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": signed_jwt,
        "scope": scope
    }
    proxies = {"https": proxy_url} if proxy_url else None

    if verbose:
        print(f"Requesting access token for SA={service_account_id}")
        print(f"Endpoint: {aud}")
        print(f"Scope: {scope}")

    response = requests.post(aud, headers=headers, data=data, proxies=proxies, verify=False)

    if response.status_code == 200:
        token_data = response.json()
        if verbose:
            print(f"✅ Access token retrieved successfully")
            print(f"   Token length: {len(token_data.get('access_token', ''))}")
            print(f"   Scope: {token_data.get('scope')}")
            print(f"   Expires in: {token_data.get('expires_in')} seconds")
        return token_data.get("access_token")
    else:
        print(f"❌ Failed to retrieve access token: {response.status_code}")
        print(f"   Response: {response.text}")
        raise Exception(f"Failed to get token: {response.status_code} {response.text}")

def load_credentials_from_file(file_path: str) -> Dict:
    """Load service account credentials from accounts.txt file"""
    credentials = {}
    current_jwk = ""
    in_jwk = False
    
    with open(file_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith('ServiceAccountID:'):
                credentials['service_account_id'] = line.split(':', 1)[1].strip()
            elif line.startswith('ServiceAccountJWK:'):
                in_jwk = True
                current_jwk = ""
            elif in_jwk:
                if line.startswith('{'):
                    current_jwk = line
                elif line.endswith('}'):
                    current_jwk += line
                    credentials['jwk_dict'] = json.loads(current_jwk)
                    in_jwk = False
                else:
                    current_jwk += line
    
    return credentials

def load_config_from_json(file_path: str) -> Dict:
    """Load configuration from JSON config file"""
    with open(file_path, 'r') as f:
        config = json.load(f)
    
    # Validate required fields
    required_fields = ['service_account_id', 'jwk_dict', 'platform', 'scope', 'exp_seconds']
    for field in required_fields:
        if field not in config:
            raise ValueError(f"Missing required field '{field}' in config file")
    
    return config

def main():
    parser = argparse.ArgumentParser(
        description="Get PAIC Service Account Access Token",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Example:
  # Get token from JSON config file
  python get_token_cli.py -C config.json
        """
    )
    
    parser.add_argument(
        '-C', '--config',
        required=True,
        help='JSON config file path (required)'
    )

    args = parser.parse_args()

    try:
        # Load config file
        credentials = load_config_from_json(args.config)
        
        # Use all values from config file
        platform_url = credentials['platform']
        scope = credentials['scope']
        exp_seconds = credentials['exp_seconds']
        proxy_url = credentials.get('proxy')
        verbose = credentials.get('verbose', False)
        output_format = credentials.get('output_format', 'token')
        
        if 'service_account_id' not in credentials or 'jwk_dict' not in credentials:
            print("❌ Could not find service account credentials in file")
            sys.exit(1)

        # Get token
        token = get_service_account_access_token(
            platform_url=platform_url,
            service_account_id=credentials['service_account_id'],
            jwk_dict=credentials['jwk_dict'],
            exp_seconds=exp_seconds,
            scope=scope,
            proxy_url=proxy_url,
            verbose=verbose
        )

        # Output token in requested format
        if output_format == 'token':
            print(token)
        elif output_format == 'bearer':
            print(f"Bearer {token}")
        elif output_format == 'json':
            print(json.dumps({"access_token": token, "token_type": "Bearer"}))

    except FileNotFoundError:
        print(f"❌ Config file not found: {args.config}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in config file: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()