#!/bin/bash
# Setup script for creating new PlanaVista repository

echo "🎨 PlanaVista - New Repository Setup"
echo "=============================================="
echo ""
echo "This script will help you create a new GitHub repository for PlanaVista."
echo ""

# Check if we're in the right directory
if [ ! -f "hacs.json" ]; then
    echo "❌ Error: Please run this script from the planavista-export directory"
    exit 1
fi

echo "Step 1: Create GitHub Repository"
echo "--------------------------------"
echo "1. Go to: https://github.com/new"
echo "2. Repository name: planavista-calendar"
echo "3. Description: A beautiful, easy-to-configure Home Assistant calendar integration"
echo "4. Make it PUBLIC"
echo "5. DON'T initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo ""
read -p "Have you created the repository? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create the repository first, then run this script again."
    exit 0
fi

echo ""
read -p "Enter your GitHub username: " GITHUB_USER
read -p "Enter the repository name (default: planavista-calendar): " REPO_NAME
REPO_NAME=${REPO_NAME:-planavista-calendar}

echo ""
echo "Step 2: Initialize Git Repository"
echo "--------------------------------"

# Initialize git
git init
git add .
git commit -m "Initial commit: PlanaVista v0.1.0

A beautiful Home Assistant custom integration for wall calendars.

Features:
- UI-based configuration (zero YAML editing)
- Auto-discovery of calendars, weather, person entities
- Multiple themes (PlanaVista, Minimal, Modern, Dark)
- Multiple calendar views (day, week, month, agenda)
- Custom Lovelace card with responsive design
- Extensible architecture for future modules

This is a complete rewrite from a YAML-based configuration to a
professional custom integration worthy of community distribution."

echo ""
echo "Step 3: Push to GitHub"
echo "---------------------"

git branch -M main
git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo ""
echo "Pushing to: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your repository is live at:"
    echo "   https://github.com/${GITHUB_USER}/${REPO_NAME}"
    echo ""
    echo "Next steps:"
    echo "1. Add a repository description on GitHub"
    echo "2. Add topics: home-assistant, custom-integration, calendar, smart-home"
    echo "3. Update manifest.json and README.md with the new repository URL"
    echo "4. Create a release (v0.1.0)"
    echo "5. Submit to HACS when ready"
    echo ""
    echo "🎉 PlanaVista is ready for the community!"
else
    echo ""
    echo "❌ Push failed. Please check your credentials and try:"
    echo "   git push -u origin main"
fi
