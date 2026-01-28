# Input Validation Audit Checklist

## Schema Validation

- [ ] All API inputs validated with schema library (Zod/Joi/Yup)
- [ ] Schema defined at route level (middleware)
- [ ] Unknown properties stripped or rejected
- [ ] Type coercion explicit (not implicit)

## String Validation

- [ ] Max length enforced on all strings
- [ ] Email validated with proper regex/library
- [ ] URL validated (protocol whitelist)
- [ ] Phone normalized and validated
- [ ] HTML/script tags stripped or escaped

## Numeric Validation

- [ ] Min/max bounds enforced
- [ ] Integer vs float explicit
- [ ] Negative values handled appropriately
- [ ] Precision limits for decimals

## Array/Object Validation

- [ ] Max items limit on arrays
- [ ] Max depth limit on nested objects
- [ ] Required vs optional fields explicit
- [ ] No prototype pollution vectors

## File Upload Validation

- [ ] File type validated (magic bytes, not extension)
- [ ] File size limit enforced
- [ ] Filename sanitized
- [ ] Upload directory outside webroot
- [ ] Antivirus scan (if applicable)

## ID/Reference Validation

- [ ] IDs validated as correct format (UUID, CUID)
- [ ] Foreign key references verified to exist
- [ ] User owns/can access referenced resource
- [ ] No IDOR vulnerabilities

## Frontend Validation

- [ ] Client-side validation matches server
- [ ] Form validation provides clear feedback
- [ ] Server always re-validates (defense in depth)

## Error Messages

- [ ] Validation errors specific but safe
- [ ] No internal paths/structure leaked
- [ ] Field names mapped to user-friendly labels
- [ ] Batch errors returned (not one at a time)

## Edge Cases

- [ ] Empty strings handled (vs null vs undefined)
- [ ] Unicode handled correctly
- [ ] Zero-width characters stripped
- [ ] Locale-specific formats handled
