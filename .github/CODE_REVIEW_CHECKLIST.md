# Code Review Checklist

Use this checklist when reviewing pull requests to ensure code quality and
consistency.

## Code Quality

- [ ] Code is clean and follows project conventions
- [ ] No commented-out code or TODO comments
- [ ] Variable and function names are descriptive
- [ ] Functions are small and single-purpose
- [ ] Complex logic is documented with comments
- [ ] No magic numbers or hardcoded values
- [ ] Error handling is appropriate and consistent
- [ ] No console.log statements left in code

## TypeScript / Type Safety

- [ ] All functions have proper type annotations
- [ ] No use of `any` type (unless absolutely necessary)
- [ ] Interfaces/types are used appropriately
- [ ] Proper null/undefined handling
- [ ] No type assertions without good reason
- [ ] Enums used for fixed sets of values

## React / Frontend

- [ ] Components are properly structured
- [ ] Hooks follow rules (no conditional hooks)
- [ ] useEffect dependencies are correct
- [ ] No unnecessary re-renders
- [ ] Proper key props on lists
- [ ] Accessibility considerations (ARIA labels, semantic HTML)
- [ ] Responsive design implemented
- [ ] Loading and error states handled

## Backend / API

- [ ] Input validation implemented
- [ ] Proper error handling and responses
- [ ] Database queries are efficient
- [ ] No N+1 query problems
- [ ] Transactions used where appropriate
- [ ] Proper HTTP status codes
- [ ] API endpoints follow RESTful conventions
- [ ] Rate limiting considered

## Security

- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Sensitive data not logged
- [ ] Authentication/authorization checks in place
- [ ] Input sanitization performed
- [ ] CORS configured properly
- [ ] Environment variables used for secrets

## Testing

- [ ] Unit tests cover new functionality
- [ ] Edge cases are tested
- [ ] Error scenarios are tested
- [ ] Tests are readable and maintainable
- [ ] Test coverage meets standards (>70%)
- [ ] Integration tests added if needed

## Performance

- [ ] No unnecessary database queries
- [ ] Efficient algorithms used
- [ ] Large lists use pagination
- [ ] Images optimized
- [ ] Lazy loading implemented where appropriate
- [ ] Bundle size impact considered

## Documentation

- [ ] Complex logic is documented
- [ ] API changes documented
- [ ] README updated if needed
- [ ] Type definitions are clear
- [ ] Examples provided for complex features

## Review Response Times

- **Critical Bug Fix**: Within 2 hours
- **Regular PR**: Within 24 hours
- **Large Feature**: Within 48 hours

## Review Comment Guidelines

### ✅ Good Review Comments

- Be specific: "Consider extracting this logic into a separate function for
  better testability"
- Explain why: "This could cause a memory leak. The useEffect cleanup function
  should cancel the subscription"
- Praise good work: "Great use of the nullish coalescing operator here!"

### ❌ Poor Review Comments

- Too vague: "This is wrong."
- Accusatory: "Why did you do it this way?"
- Not helpful: "LGTM" (with no actual review)

## Best Practices

1. **Be Respectful** - Assume good intent, focus on the code not the person
2. **Be Specific** - Point to exact lines and suggest alternatives
3. **Explain Why** - Don't just say what's wrong, explain the impact
4. **Ask Questions** - "Could we..." instead of "You should..."
5. **Praise Good Work** - Call out clever solutions and improvements
6. **Timely Reviews** - Don't let PRs sit for days
7. **Test the Code** - Pull down and run the changes locally
8. **Check Tests** - Verify tests actually test what they claim to
