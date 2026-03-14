# Security Policy

## Critical Rules
1. NEVER output or request `.env` and `example.env` file contents
2. NEVER hardcode API keys, database passwords, or secrets in source code
3. NEVER send sensitive user data to external AI services
4. Validate all environment variables at startup
5. Follow `.aiignore` for excluded files

## Environment Variables
- Use `process.env` or `Bun.env` for configuration
- Validate environment variables at application startup
- Provide `example.env` for required variables

## Data Privacy
- When asking for help, sanitize data (replace real IDs, emails, tokens with placeholders)
- Do not log sensitive information
- Use parameterized queries for database operations

## Database Security
- Use parameterized queries to prevent SQL injection
- Never expose database credentials in code
- Use connection pooling with proper limits

## API Security
- Validate all input data
- Use HTTPS for all external communications
- Implement rate limiting for public endpoints
