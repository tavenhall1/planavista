# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in PlanaVista, please report it responsibly:

1. **Do NOT open a public issue** for security vulnerabilities.
2. **Email**: Open a private security advisory via [GitHub Security Advisories](https://github.com/tavenhall1/planavista/security/advisories/new).
3. **Include**: A description of the vulnerability, steps to reproduce, and potential impact.

You can expect:
- **Acknowledgement** within 48 hours
- **Status update** within 7 days
- **Fix or mitigation** as soon as practical

## Scope

PlanaVista runs entirely locally within your Home Assistant instance. It does not make external network requests or store data outside your HA installation. Security concerns are primarily related to:

- Input validation in configuration flows
- Frontend XSS prevention
- Safe handling of calendar entity data
- Proper use of Home Assistant authentication and authorization

## Disclosure Policy

We follow coordinated disclosure. Please allow reasonable time for a fix before publishing details publicly.
