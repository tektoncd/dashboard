#!/bin/bash

echo "npm installing"
npm install

echo "running build_ko"
npm run build_ko

ko apply -f config