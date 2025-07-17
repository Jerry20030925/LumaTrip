#!/bin/bash

# Explore the current directory structure
echo "=== Current working directory ==="
pwd

echo "=== Directory contents ==="
ls -la

echo "=== Recursive directory listing ==="
find . -type f -name "*" | head -20

echo "=== Looking for common config files ==="
find . -name "package.json" -o -name "requirements.txt" -o -name "Cargo.toml" -o -name "go.mod" -o -name "pom.xml" -o -name "build.gradle" -o -name "Makefile" -o -name "CMakeLists.txt" -o -name "setup.py" -o -name "pyproject.toml" -o -name "Dockerfile" -o -name "docker-compose.yml"

echo "=== Looking for test directories ==="
find . -type d -name "*test*" -o -name "*spec*"

echo "=== Looking for README files ==="
find . -name "README*" -o -name "readme*"