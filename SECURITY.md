# Security reporting and configuration

Do not include employee records, passwords, access tokens or database dumps in public issues or pull requests. Use GitHub private vulnerability reporting if enabled, or contact the repository owner privately.

Committed accounts/passwords are demonstration data. The actual `.env` is not versioned. Use server-specific credentials, independent random signing secrets and HTTPS; replace/remove demonstration accounts before exposing an instance to real users. See [DEPLOYMENT.md](DEPLOYMENT.md).

The API enforces role scopes server-side. New migration/payroll changes should test authorization, preservation of existing data and numeric boundaries. A passing test suite is not a security audit or statutory payroll certification.
