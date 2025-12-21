#!/bin/sh

# Install CocoaPods if not already installed
if ! command -v pod &> /dev/null
then
    echo "Installing CocoaPods..."
    gem install cocoapods
fi

# Navigate to the iOS app directory
cd ios/App

# Install pods
echo "Installing CocoaPods dependencies..."
pod install

echo "CocoaPods installation complete!"
