# Call Stack Tracing Checklist

## Root Cause Investigation

- [ ] Error message captured
- [ ] Stack trace collected
- [ ] Request context captured
- [ ] Reproduction steps documented

## Backward Tracing

- [ ] Identify where error thrown
- [ ] Trace back to calling function
- [ ] Identify data source
- [ ] Find original trigger

## Evidence Collection

- [ ] Log entries for request ID
- [ ] Database queries executed
- [ ] External API calls made
- [ ] User actions leading to error

## LSP Navigation

- [ ] Use `mcp__cclsp__find_references` for callers
- [ ] Use `mcp__cclsp__find_definition` for origin
- [ ] Navigate through call chain
- [ ] Document flow path

## Instrumentation

- [ ] Add logging at key points
- [ ] Capture variable states
- [ ] Log function entry/exit
- [ ] Track data transformations

## Pattern Analysis

- [ ] Frequency of error
- [ ] Common conditions
- [ ] Related errors
- [ ] Timing patterns

## Fix Verification

- [ ] Root cause identified
- [ ] Fix addresses cause (not symptom)
- [ ] Tests prevent regression
- [ ] Similar patterns checked
