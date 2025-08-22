#!/usr/bin/env python3
"""
Simple database seeding script for OpenBioCure authentication service
This script works with the existing auth service setup
"""

import os
import sys
import json
import requests
from typing import Dict, List

# Seed data
DEVELOPMENT_USERS = [
    {
        "email": "admin@openbiocure.com",
        "password": "admin123456",
        "name": "Admin User",
        "features": ["full_access", "admin_panel", "user_management"]
    },
    {
        "email": "researcher@openbiocure.com", 
        "password": "researcher123456",
        "name": "Senior Researcher",
        "features": ["research_tools", "ai_assistant", "data_analysis"]
    },
    {
        "email": "demo@demo.com",
        "password": "demo123456",
        "name": "Demo User", 
        "features": ["basic_research", "ai_assistant_limited"]
    },
    {
        "email": "test@test.com",
        "password": "test123456",
        "name": "Test User",
        "features": ["basic_research"]
    },
    {
        "email": "scholar@university.edu",
        "password": "scholar123456",
        "name": "Dr. Jane Scholar",
        "features": ["research_tools", "publication_tools"]
    }
]

def check_auth_service():
    """Check if auth service is running"""
    try:
        response = requests.get("http://localhost:8001/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Auth service is running - Status: {health_data.get('status', 'unknown')}")
            return True
        else:
            print(f"❌ Auth service returned status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to auth service: {e}")
        print("Please make sure the auth service is running on http://localhost:8001")
        return False

def seed_user(user_data: Dict) -> bool:
    """Seed a single user via API"""
    try:
        # Try to register the user
        response = requests.post(
            "http://localhost:8001/auth/register",
            json={
                "email": user_data["email"],
                "password": user_data["password"],
                "name": user_data["name"]
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"✅ Created user: {user_data['name']} ({user_data['email']})")
            return True
        elif response.status_code == 400:
            error_detail = response.json().get('detail', 'Unknown error')
            if 'already exists' in str(error_detail).lower():
                print(f"⚠️  User {user_data['email']} already exists, skipping...")
                return True
            else:
                print(f"❌ Failed to create {user_data['email']}: {error_detail}")
                return False
        else:
            print(f"❌ Failed to create {user_data['email']}: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error creating {user_data['email']}: {e}")
        return False

def test_login(email: str, password: str) -> bool:
    """Test login for a user"""
    try:
        response = requests.post(
            "http://localhost:8001/auth/login",
            json={
                "email": email,
                "password": password
            },
            timeout=10
        )
        
        if response.status_code == 200:
            login_data = response.json()
            if 'access_token' in login_data:
                print(f"✅ Login test successful for {email}")
                return True
            else:
                print(f"❌ Login response missing access_token for {email}")
                return False
        else:
            print(f"❌ Login failed for {email}: HTTP {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error testing login for {email}: {e}")
        return False

def main():
    print("🌱 OpenBioCure Simple Database Seeding")
    print("=" * 50)
    
    # Check if auth service is running
    if not check_auth_service():
        print("\n💡 To start the auth service, run:")
        print("   cd auth-service && python3 main.py")
        print("   or")
        print("   make start-dev")
        return 1
    
    print(f"\n👥 Seeding {len(DEVELOPMENT_USERS)} users...")
    print("-" * 40)
    
    success_count = 0
    for user_data in DEVELOPMENT_USERS:
        if seed_user(user_data):
            success_count += 1
    
    print(f"\n📊 Seeding Results:")
    print(f"✅ Successfully created/verified: {success_count}/{len(DEVELOPMENT_USERS)} users")
    
    if success_count > 0:
        print(f"\n🧪 Testing login for first user...")
        test_user = DEVELOPMENT_USERS[0]
        test_login(test_user["email"], test_user["password"])
    
    print(f"\n🔑 Development Login Credentials:")
    print("-" * 40)
    for user in DEVELOPMENT_USERS:
        print(f"Email: {user['email']}")
        print(f"Password: {user['password']}")
        print(f"Name: {user['name']}")
        print("-" * 40)
    
    print("\n✅ Seeding completed!")
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
