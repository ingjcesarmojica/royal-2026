#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building API..."
cd apps/api
npm install
npx nest build
cd ../..

echo "Build complete!"
