#!/bin/bash

# Create directory for SSL certificates if it doesn't exist
mkdir -p ssl

# Generate private key
openssl genrsa -out ssl/private.key 2048

# Generate CSR (Certificate Signing Request)
openssl req -new -key ssl/private.key -out ssl/certificate.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -days 365 -in ssl/certificate.csr -signkey ssl/private.key -out ssl/certificate.crt

echo "SSL certificate has been generated in the ssl directory"
echo "Files created:"
echo "- ssl/private.key (private key)"
echo "- ssl/certificate.crt (certificate)"
echo "- ssl/certificate.csr (certificate signing request)" 