
import requests
import sys

def check_cors(url, origin):
    print(f"Checking CORS for {url} with origin {origin}")
    headers = {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
    
    try:
        # Send OPTIONS request (Preflight)
        response = requests.options(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        print("Headers:")
        for k, v in response.headers.items():
            if 'Access-Control' in k:
                print(f"  {k}: {v}")
        
        if 'Access-Control-Allow-Origin' in response.headers:
            print("✅ CORS headers present.")
        else:
            print("❌ CORS headers MISSING.")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Is it running?")

if __name__ == "__main__":
    check_cors("http://127.0.0.1:8000/accounts/login/", "http://localhost:5173")
