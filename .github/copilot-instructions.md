# GitHub Copilot Code Review Guidelines

## Project Context

This is a **private alpha travel planning application** with the following priorities:

1. **Move fast** - Ship features quickly, iterate based on user feedback
2. **Stay secure** - Protect user data and API credentials
3. **Maintain quality** - Keep code readable for future changes
4. **Explicit tradeoffs** - Document decisions when we choose speed over perfection

**Current users**: ~10 close friends/family (non-technical, iOS-focused)

---

## Review Priorities

### 🔴 Critical (Always flag these)

**Security Issues:**

- [ ] API keys or secrets exposed in code
- [ ] Missing authentication checks on API endpoints
- [ ] SQL injection or command injection vulnerabilities
- [ ] Insecure handling of user data (PII in logs, unencrypted storage)
- [ ] CORS misconfiguration allowing unauthorized origins
- [ ] Missing rate limiting on public endpoints
- [ ] Clerk tokens not verified on protected routes

**Data Integrity:**

- [ ] User data from one session leaking into another
- [ ] Race conditions in session management
- [ ] Unhandled promise rejections that could crash the server
- [ ] Missing error boundaries in React components

### 🟡 Important (Flag if straightforward to fix)

**Code Maintainability:**

- [ ] Functions longer than 50 lines (suggest breaking up)
- [ ] Missing type hints in Python or TypeScript types
- [ ] Unclear variable names (e.g., `data`, `temp`, `x`)
- [ ] Copy-pasted code that should be abstracted
- [ ] Missing docstrings for complex logic

**Error Handling:**

- [ ] Try-catch blocks that swallow errors silently
- [ ] Generic error messages that don't help debugging
- [ ] API calls without timeout handling
- [ ] Missing fallbacks for external service failures (YouTube API, LLM APIs)

**Performance:**

- [ ] N+1 query patterns (e.g., fetching transcripts in loop)
- [ ] Large objects stored in memory unnecessarily
- [ ] Missing async/await for I/O operations
- [ ] Inefficient loops over large datasets

### 🟢 Nice-to-Have (Mention, but don't block)

- [ ] Opportunities to use more concise syntax
- [ ] Consistent formatting (handled by linters mostly)
- [ ] Better variable naming for clarity
- [ ] Adding helpful code comments for complex logic

---

## What NOT to Flag

We're optimizing for velocity in private alpha, so **don't flag these unless they directly impact security or data integrity**:

❌ **Test coverage** - We test critical paths only (authentication, data extraction, chat flow), not aiming for percentage targets

❌ **Comprehensive input validation** - Basic validation is fine; we trust our small user base and handle errors gracefully

❌ **Perfect separation of concerns** - Pragmatic abstractions are fine; don't over-engineer

❌ **Documentation completeness** - Code should be self-documenting where possible; extensive docs can wait

❌ **Minor performance optimizations** - Unless it causes noticeable lag (>2s response time), it's fine

❌ **Edge case handling** - Focus on happy path + obvious failure modes; rare edge cases are acceptable for now

---

## Explicit Tradeoffs We've Made

When reviewing code, recognize these **intentional decisions** and don't flag them:

### 1. **In-Memory Session Storage**

- **Why**: Fast to implement, sufficient for <50 concurrent users
- **Tradeoff**: Sessions lost on server restart
- **Document if**: Adding new session data that should persist
- **Future**: Migrate to Redis/PostgreSQL when user base grows

### 2. **No Comprehensive Testing**

- **Why**: Moving fast, small team, exploratory phase
- **Tradeoff**: May introduce regressions
- **Document if**: Adding authentication, payment, or data deletion logic
- **Critical paths that MUST be tested**:
  - Clerk authentication flow
  - API endpoint authorization
  - LLM extraction with both OpenAI and Anthropic
  - Chat context retrieval

### 3. **Synchronous LLM Calls**

- **Why**: Simpler code, acceptable latency for now (<30s)
- **Tradeoff**: User waits during video processing
- **Document if**: Users complain about wait times
- **Future**: Background jobs with progress indicators

### 4. **Limited Error Recovery**

- **Why**: Small user base, can fix issues manually
- **Tradeoff**: Users may need to retry failed operations
- **Document if**: Error happens frequently or loses user data
- **Must handle**: Network timeouts, LLM API failures, invalid YouTube URLs

### 5. **No Database for MVP**

- **Why**: Faster development, fewer dependencies
- **Tradeoff**: No persistent user data, analytics are limited
- **Document if**: Users request "save my trips" feature
- **Future**: Add PostgreSQL when user saves/history needed

---

## Code Review Checklist

When reviewing a PR, focus on these key areas:

### Security & Authentication

```python
# ❌ BAD: Missing auth check
@router.post("/ingest")
async def ingest_videos(request: IngestRequest):
    # Anyone can call this!
    pass

# ✅ GOOD: Protected endpoint
@router.post("/ingest")
async def ingest_videos(
    request: IngestRequest,
    current_user: dict = Depends(get_current_user)
):
    # Only authenticated users can access
    pass
```

### Error Handling

```python
# ❌ BAD: Silent failure
try:
    transcript = youtube_service.get_transcript(video_id)
except Exception:
    pass  # User has no idea what went wrong

# ✅ GOOD: Logged error with context
try:
    transcript = youtube_service.get_transcript(video_id)
except Exception as e:
    logger.error(f"Failed to fetch transcript for {video_id}: {str(e)}")
    raise HTTPException(
        status_code=500,
        detail=f"Could not fetch transcript for video {video_id}"
    )
```

### Observability

```python
# ❌ BAD: No user context in traces
@trace_function(name="chat")
async def chat(request: ChatRequest):
    # Can't connect user behavior to traces
    pass

# ✅ GOOD: User context included
@trace_function(name="chat")
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    span = trace.get_current_span()
    span.set_attribute("user.id", current_user["user_id"])
    span.set_attribute("user.query", request.message)
```

### Type Safety

```typescript
// ❌ BAD: Any types
async function ingestVideos(urls: any, provider: any): Promise<any> {
  // No type safety
}

// ✅ GOOD: Explicit types
async function ingestVideos(
  urls: string[],
  provider: "openai" | "anthropic"
): Promise<IngestResponse> {
  // TypeScript catches errors at compile time
}
```

### Documentation of Tradeoffs

```python
# ❌ BAD: No explanation of limitations
def process_videos(video_urls: list[str]):
    # Processes videos synchronously
    for url in video_urls:
        extract_places(url)

# ✅ GOOD: Explicit tradeoff documented
def process_videos(video_urls: list[str]):
    """
    Process videos synchronously.

    TRADEOFF: This blocks the request for all videos (~5-10s per video).
    Acceptable for private alpha with <10 videos per request.

    TODO: If users complain about wait times, implement background
    jobs with WebSocket progress updates.
    """
    for url in video_urls:
        extract_places(url)
```

---

## Specific Code Patterns to Flag

### 1. Secrets in Code

```python
# ❌ CRITICAL: Never commit secrets
openai_key = "sk-proj-abc123..."

# ✅ Use environment variables
openai_key = os.getenv("OPENAI_API_KEY")
if not openai_key:
    raise ValueError("OPENAI_API_KEY not set")
```

### 2. Missing User Context in Logs

```python
# ❌ BAD: Can't trace issues to specific users
logger.info("Processing 5 videos")

# ✅ GOOD: Include user ID for debugging
logger.info(f"User {user_id} processing 5 videos")
```

### 3. Unprotected API Endpoints

```python
# ❌ CRITICAL: Public endpoint exposing user data
@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    return sessions[session_id]  # Anyone can access any session!

# ✅ Protected with ownership check
@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    session = sessions.get(session_id)
    if not session or session.user_id != current_user["user_id"]:
        raise HTTPException(403, "Not authorized")
    return session
```

### 4. Swallowed Errors

```typescript
// ❌ BAD: User sees nothing when things break
try {
  await ingestVideos(urls);
} catch (error) {
  console.log(error);
}

// ✅ GOOD: User gets feedback
try {
  await ingestVideos(urls);
} catch (error) {
  console.error("Ingest failed:", error);
  setError("Failed to process videos. Please try again.");
  // Optionally: Send to error tracking (Sentry, etc.)
}
```

### 5. Missing Timeout Handling

```python
# ❌ BAD: Could hang indefinitely
response = await openai_client.chat.completions.create(...)

# ✅ GOOD: Timeout prevents hanging requests
try:
    response = await asyncio.wait_for(
        openai_client.chat.completions.create(...),
        timeout=60.0  # 60 seconds max
    )
except asyncio.TimeoutError:
    raise HTTPException(504, "LLM request timed out")
```

---

## Review Tone & Communication

When commenting on PRs:

✅ **Do:**

- Explain _why_ something is an issue, not just _what_
- Suggest specific fixes with code examples
- Acknowledge good patterns when you see them
- Distinguish between "must fix" and "nice to have"
- Reference this document when relevant

❌ **Don't:**

- Be pedantic about style (we have linters for that)
- Block PRs for minor issues that don't affect functionality
- Request changes that contradict our explicit tradeoffs
- Nitpick variable naming unless it's genuinely confusing

### Example Comments

**🔴 Critical Issue:**

```
🔴 SECURITY: This endpoint is missing authentication.

Anyone can call `/api/ingest` and consume our LLM credits.

Fix: Add `current_user: dict = Depends(get_current_user)` to the function signature.

See: Authentication & Authorization section in code review guidelines.
```

**🟡 Important but Not Blocking:**

```
🟡 This error is swallowed silently, making debugging difficult.

Consider logging the error with user context:
`logger.error(f"User {user_id} failed to fetch transcript: {str(e)}")`

This helps trace issues in Langfuse. Not blocking, but would appreciate the change.
```

**🟢 Nice-to-Have:**

```
🟢 Minor: This function is getting long (60 lines).

Consider extracting the LLM call logic into a separate function for readability.
Not blocking - feel free to address in a future refactor.
```

---

## When to Suggest Adding Tests

**Always suggest tests for:**

- Authentication & authorization logic
- User data handling (session management, data isolation)
- LLM extraction parsing (ensuring structured output is correct)
- Critical error paths (payment processing if we add it, data deletion)

**Don't require tests for:**

- UI components (visual testing is sufficient for our scale)
- Simple CRUD operations
- Formatting/styling logic
- Non-critical feature flags

**Example Test Request:**

```
This changes our Clerk token verification logic. Can you add a test to ensure:
1. Valid tokens are accepted
2. Invalid/expired tokens are rejected
3. Missing tokens return 401

This is critical security logic and worth the test coverage.
```

---

## Common Questions

**Q: Should I flag missing docstrings?**
A: Only if the function does something non-obvious. If `get_transcript(video_id)` is self-explanatory, don't flag it.

**Q: What about code duplication?**
A: Flag if it's duplicated 3+ times or if the duplicated logic is complex. Small repeated patterns (<10 lines) are fine.

**Q: Should I suggest performance optimizations?**
A: Only if it causes user-visible latency (>2s response time) or could cause issues at our scale (~50 concurrent users max).

**Q: How detailed should error messages be?**
A: Enough for the user to understand what went wrong and what to try next. E.g., "Invalid YouTube URL format" is good; "Error 500" is not.

**Q: Should I flag console.log statements?**
A: In backend code, yes (use `logger` instead). In frontend, only if they log sensitive data (API keys, user emails, etc.).

---

## Updates to These Guidelines

This document will evolve as we learn what works:

- **After each sprint**: Review what issues we caught (or missed) in production
- **When scaling up**: Revisit tradeoffs (e.g., when we hit 100+ users, add Redis)
- **When adding sensitive features**: Tighten review requirements (e.g., payments, user data export)

**To propose changes**: Open a PR updating this file with rationale for the change.

---

## Summary

**In code reviews, prioritize:**

1. 🔴 Security (authentication, secrets, data isolation)
2. 🔴 Data integrity (user sessions, error handling)
3. 🟡 Maintainability (readable code, clear errors)
4. 🟢 Everything else (nice-to-haves)

**Remember:** We're optimizing for **learning fast** while **keeping users safe**. Balance velocity with quality, and always document the tradeoffs we make.
