#!/usr/bin/env bash

mkdir -p keys && \
openssl genpkey -algorithm RSA -out keys/private.pem -pkeyopt rsa_keygen_bits:2048 && \
openssl rsa -pubout -in keys/private.pem -out keys/public.pem && \
chmod 600 keys/private.pem && \
echo "✅ Done! Keys are in ./keys"
