# Data Flow Validation Checklist

## Entry Points

- [ ] User input identified
- [ ] External API data identified
- [ ] File uploads identified
- [ ] Query parameters identified

## Validation Layers

- [ ] Input validation at API boundary
- [ ] Schema validation (Zod/Yup)
- [ ] Business rule validation
- [ ] Database constraint validation

## Transformation Points

- [ ] Data transformations documented
- [ ] Type conversions explicit
- [ ] Sanitization applied
- [ ] Encoding/decoding correct

## Storage Points

- [ ] Database writes validated
- [ ] File system writes validated
- [ ] Cache writes validated
- [ ] External API writes validated

## Output Points

- [ ] Response validation
- [ ] Sensitive data excluded
- [ ] Output encoding applied
- [ ] Format correct

## Defense in Depth

- [ ] Validation at every layer
- [ ] No trusting upstream validation
- [ ] Principle of least privilege
- [ ] Fail secure

## Error Paths

- [ ] Validation failures handled
- [ ] Invalid data rejected
- [ ] Error messages don't leak data
- [ ] Logging captures context
