# API Contract Validation Checklist

## Request Schema

- [ ] All inputs defined with types
- [ ] Required vs optional fields documented
- [ ] Validation rules specified
- [ ] Default values documented
- [ ] Array size limits defined
- [ ] String length limits defined

## Response Schema

- [ ] Success response schema defined
- [ ] Error response schema defined
- [ ] Status codes documented
- [ ] Response field types specified
- [ ] Nullable fields explicitly marked
- [ ] Pagination structure consistent

## Contract Tests

- [ ] Test for valid request
- [ ] Test for invalid request (validation)
- [ ] Test for missing required fields
- [ ] Test for unexpected fields
- [ ] Test for boundary values
- [ ] Test for response schema compliance

## Versioning

- [ ] Breaking changes in new API version
- [ ] Deprecation strategy documented
- [ ] Migration guide provided
- [ ] Backward compatibility maintained

## Documentation

- [ ] OpenAPI/Swagger spec generated
- [ ] Examples provided for requests/responses
- [ ] Error codes documented
- [ ] Rate limits documented
- [ ] Authentication requirements documented

## Error Handling

- [ ] Validation errors return 400
- [ ] Auth errors return 401/403
- [ ] Not found returns 404
- [ ] Server errors return 500
- [ ] Error messages user-friendly
