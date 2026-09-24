#!/bin/bash

echo "Running 2048 application tests..."

if [ -f "src/index.html" ]; then
    echo "PASS: index.html exists"
else
    echo "FAIL: index.html is missing"
    exit 1
fi

if grep -qi "2048" src/index.html; then
    echo "PASS: 2048 application detected"
else
    echo "FAIL: 2048 application content not detected"
    exit 1
fi

echo "All tests passed!"
