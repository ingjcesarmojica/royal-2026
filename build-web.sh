#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building Web..."
cd apps/web
npm install
npx next build
cd ../..

echo "Build complete!"
