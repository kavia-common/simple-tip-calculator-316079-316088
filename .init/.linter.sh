#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-tip-calculator-316079-316088/tip_calculator_frontend
npx eslint
ESLINT_EXIT_CODE=$?
npm run build
BUILD_EXIT_CODE=$?
 if [ $ESLINT_EXIT_CODE -ne 0 ] || [ $BUILD_EXIT_CODE -ne 0 ]; then
   exit 1
fi

