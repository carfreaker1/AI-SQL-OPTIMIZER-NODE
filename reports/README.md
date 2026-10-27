# A MINOR PROJECT REPORT

## AI-Powered SQL Query Optimizer and Target Format Converter

Submitted towards the academic requirements of the Master of Computer Applications programme.

Submitted by: [Student Name]

Roll / Registration Number: [Roll Number]

Under the guidance of: [Guide Name and Designation]

Department: [Department Name]

Institution: [Institution Name]

Academic Session: [Academic Session]

Submission Date: [Date]

---

# Abstract

SQL query development requires attention to correctness, performance, and compatibility with the application framework. Students and developers may find it difficult to identify inefficient query patterns, evaluate potential indexes, and translate SQL into framework-specific expressions. The AI-Powered SQL Query Optimizer and Target Format Converter addresses this problem through a browser-based interface that presents query improvement suggestions and target-format conversions in one place.

The application uses React for the user interface, Node.js and Fastify for request processing, Redis for temporary result caching, and a Groq-hosted language model for generating recommendations. Users submit SQL and select a target such as Laravel, Prisma, TypeORM, Mongoose, Django ORM, or raw SQL. The backend requests a structured response containing proposed SQL, suggested indexes, potential issues, explanatory text, and converted code. Successful responses are cached for one hour to reuse results for repeated requests.

The project demonstrates component-based frontend development, REST API integration, prompt construction, structured response handling, and cache-aside processing. Its output is advisory: the implementation does not connect to the user's database, execute SQL, inspect actual indexes, or measure execution plans. Therefore, generated suggestions require review and database-specific verification. This report analyses the supplied implementation, documents its design and limitations, and proposes a practical testing and enhancement strategy without claiming unmeasured performance gains.

Keywords: SQL, artificial intelligence, query optimisation, React, Fastify, Redis, Groq, ORM.

# Table of Contents

1. Introduction
2. System Analysis
3. System Design
4. System Requirements
5. Implementation & Testing
6. Limitations & Future Scope
7. Conclusion
8. Bibliography

The chapter order follows the supplied Task Manager report. Its task-management features and database entities have been replaced with material specific to this project. Page numbers should be generated from the final Word layout.

# CHAPTER 1 — INTRODUCTION

## 1.1 Project Overview

The AI-Powered SQL Query Optimizer and Target Format Converter is a web application that assists users in reviewing SQL and generating alternative representations for application development. It combines an interactive chat-style interface with an AI service and a temporary response cache.

A user enters a SQL statement and chooses an output format. The application returns a suggested optimised statement, potential performance concerns, recommended indexes, a narrative explanation, and converted code. Each submission is processed independently; the visible chat history is not sent to the model as conversational context.

The repository README describes a SQL optimisation project. Although its brief description mentions OpenAI, the implemented service uses the OpenAI client library with a Groq API endpoint and the configured model identifier llama-3.3-70b-versatile. This report follows the implementation when documentation and source code differ.

## 1.2 Project Motivation

Query improvement involves more than rewriting syntax. Developers must consider table structure, indexes, data volume, filtering, joins, and the semantics of the result. Beginners may recognise slow behaviour without knowing which aspect of the query to investigate.

Framework conversion introduces an additional learning task. A developer working in Laravel or Prisma must understand both SQL intent and the framework's query-building conventions. An explanatory assistant can provide a useful starting point for study, experimentation, and code review.

Repeated demonstration queries can also cause unnecessary external requests. Redis caching allows the application to reuse a previous result, making repeated interactions less dependent on another model invocation.

## 1.3 Problem Statement

Develop a unified application that accepts SQL, generates understandable improvement suggestions, proposes indexes, and produces target-format code while reusing successful results for repeated requests.

The principal challenge is to present useful assistance without confusing generated recommendations with verified database findings. SQL text alone does not reveal existing indexes, schema constraints, data distribution, or the database engine's chosen execution plan.

## 1.4 Objectives

- Provide a simple interface for SQL submission and target selection.
- Generate proposed query rewrites and explanations.
- Identify potential performance issues and suggest indexes for review.
- Produce code for the target formats exposed in the interface.
- Reuse successful responses through a one-hour Redis cache.
- Display loading states, errors, and structured results clearly.
- Maintain separate frontend, routing, AI-service, and caching modules.

## 1.5 Scope

The implemented scope covers query submission, AI-assisted analysis, target conversion, temporary caching, and browser-based result display. It does not include authentication, a persistent user history, database connections, automatic index creation, or measured SQL performance benchmarking.

The intended users are students, developers, and instructors exploring SQL improvement and framework integration. The application is a development and learning prototype; operational deployment requires additional validation, reliability, and access controls.

# CHAPTER 2 — SYSTEM ANALYSIS

## 2.1 Existing Approach

Conventional query review involves reading SQL, consulting documentation, checking database execution plans, and manually translating expressions into application code. These activities provide valuable evidence but can be time-consuming for inexperienced developers.

General-purpose AI tools can suggest changes, but their responses may lack a consistent structure. This project organises the request and response around a fixed set of fields, provides a dedicated interface, and reuses results through caching.

## 2.2 Proposed System

The proposed workflow brings SQL analysis and format conversion into a single request. React collects the input; Fastify coordinates the request; Redis supplies a previous response when available; otherwise, the AI service generates a new response.

The practical benefit is consolidated assistance and repeat-request reuse. Any claim that the resulting SQL executes faster must be evaluated separately against a representative database.

## 2.3 Functional Requirements

| ID | Requirement | Implementation evidence |
| --- | --- | --- |
| FR-01 | Accept SQL input | ChatInput.jsx provides a multiline text area. |
| FR-02 | Select an output format | Six choices are defined in TARGET_OPTIONS. |
| FR-03 | Submit a request | App.jsx sends query and target through Axios. |
| FR-04 | Reject missing query values | sql.route.js returns HTTP 400 for a falsy query. |
| FR-05 | Generate analysis and conversion | ai.service.js calls the configured Groq model. |
| FR-06 | Reuse successful results | cache.service.js reads and writes Redis values. |
| FR-07 | Display structured output | MessageBubble.jsx renders code and explanation sections. |
| FR-08 | Communicate request state | The frontend displays loading and error states. |

## 2.4 Non-Functional Requirements

Usability requires clear input controls, readable code, and understandable feedback. Maintainability is supported by separate components and services. Responsiveness is a design goal, but cross-device testing remains necessary.

Reliability requires correct handling of provider errors, invalid output, and cache failures. Some error handling exists, but Redis failures do not currently have a graceful fallback. Security and deployment quality require restricted access, safe logging, controlled origins, and protected transport; these are improvement requirements rather than completed features.

## 2.5 Actors and Use Cases

The primary actor is the user submitting SQL. Groq is an external service providing generated analysis. Redis is a supporting data store. A developer or demonstrator configures and runs the application.

| Use case | Main interaction | Result |
| --- | --- | --- |
| Analyse SQL | Enter SQL, select target, submit | Structured recommendations or an error |
| Convert query | Choose a framework or raw SQL | Generated target-format code |
| Repeat request | Resubmit identical query and target | Cached response when present and unexpired |
| Review feedback | Inspect code, issues, and explanations | User decides what to validate or revise |

For a normal submission, the user enters non-empty SQL and selects a target. The interface creates user and loading messages, then posts to the backend. The backend checks Redis and either returns cached data or requests AI analysis. The loading message is replaced with the result.

Alternative flows include missing input, provider failure, invalid JSON, and Redis errors. Frontend prevention of blank input improves usability but does not replace backend validation.

## 2.6 Feasibility Study

Technical feasibility is supported by a small modular JavaScript codebase and established web technologies. The external model performs inference remotely, so the local application does not need to host model weights or use a dedicated AI accelerator.

Operational feasibility depends on a working browser, Node.js, Redis, network access, and valid provider credentials. A local academic demonstration is straightforward once these dependencies are configured.

Economic feasibility depends on hosting, Redis deployment, and provider usage. Cache hits can avoid another inference request, but no fixed cost or savings percentage is established by this review.

Academic feasibility is strong because the project connects database concepts with API development, frontend state management, caching, and critical evaluation of AI-generated output.

## 2.7 Data Flow Analysis

At the context level, the user submits SQL and receives recommendations from the application. The application exchanges generated-analysis requests and responses with Groq and reads or writes temporary results in Redis.

```text
User -- SQL + target --> AI SQL Optimizer -- prompt --> Groq
User <-- recommendations -- Application <-- JSON ---- Groq
                              |
                       cache lookup / store
                              |
                            Redis
```

Figure 2.1: Context-level data flow.

```text
1. Capture input -> 2. Validate request -> 3. Compute cache key
                                              |
                                         4. Read Redis
                                          /         \
                                        hit         miss
                                         |            |
                                         |       5. Request AI
                                         |            |
                                         |       6. Parse JSON
                                         |            |
                                         |       7. Cache success
                                          \          /
                                        8. Return result
                                              |
                                        9. Render output
```

Figure 2.2: Request-processing decomposition. Errors return through the relevant error-handling path; unsuccessful AI results are not cached.

## 2.8 Development Methodology

An iterative methodology is appropriate for this project: establish request and response requirements, implement the interface and API, integrate AI, add caching, and evaluate failure cases. Each iteration should produce a demonstrable increment.

This is a recommended explanation of how development can be organised. The available repository does not establish sprint dates, team assignments, or a historical development schedule.

# CHAPTER 3 — SYSTEM DESIGN

## 3.1 Architectural Design

The system separates presentation, request coordination, external inference, and temporary storage. It is a client-server application with service modules rather than a Laravel MVC application like the supplied sample report.

```text
+------------------------------------------+
| Browser: React interface                 |
| Input, target selection, result display  |
+--------------------+---------------------+
                     | HTTP / JSON
+--------------------v---------------------+
| Node.js + Fastify                        |
| POST /api/sql/optimize                   |
| Request handling and cache coordination  |
+-----------+-------------------+----------+
            |                   | cache miss
+-----------v----------+  +-----v--------------------+
| Redis                |  | AI service / Groq API   |
| JSON result cache    |  | Prompt -> generated JSON|
| TTL: 3,600 seconds   |  | Configured Llama model  |
+----------------------+  +--------------------------+
```

Figure 3.1: Implemented system architecture.

## 3.2 Module Description

| Module | File | Responsibility |
| --- | --- | --- |
| Application state | frontend/src/App.jsx | Messages, loading state, and HTTP submission |
| Input control | frontend/src/components/ChatInput.jsx | Query entry, target selection, and submission |
| Conversation view | frontend/src/components/ChatWindow.jsx | Message list and automatic scrolling |
| Result renderer | frontend/src/components/MessageBubble.jsx | Code, issues, indexes, explanations, and errors |
| Code display | frontend/src/components/CodeSnippet.jsx | Syntax-highlighted code blocks |
| Server startup | backend/src/app.js | Fastify, CORS, route registration, and health endpoint |
| Optimisation route | backend/src/routes/sql.route.js | Request handling and cache-aside orchestration |
| AI integration | backend/src/services/ai.service.js | Provider request and JSON parsing |
| Cache integration | backend/src/services/cache.service.js | Redis GET and expiring SET |
| Prompt builder | backend/src/utils/prompt.js | Analysis instructions and requested response fields |

## 3.3 API Design

The application exposes GET / as a basic status endpoint. Its response is {"message":"AI SQL Optimizer Running"}. This only confirms that the application route responds; it does not prove Redis or Groq is healthy.

POST /api/sql/optimize accepts the following request:

```json
{
  "query": "SELECT id, name FROM users WHERE status = 'active';",
  "target": "prisma"
}
```

The expected successful response contains source, optimized_query, indexes, issues, explain_summary, converted_query, and explanation. The source is normally ai or cache. The output fields are requested in the prompt but are not validated against a response schema.

The backend defaults to sql when target is omitted. The frontend initially selects laravel. A missing or falsy query returns HTTP 400. Exceptions caught by the route return HTTP 500. Errors converted into objects by the AI service are returned by the route without an explicit non-success status, normally resulting in HTTP 200 with an error field.

## 3.4 Cache Design

The current key is the hexadecimal MD5 digest of query + target. The result is serialised as JSON and stored with an expiration of 3,600 seconds. Redis EX expresses the expiration in seconds [R2].

```text
Request(query, target)
        |
        v
MD5(query + target) ---- identifies ----> Redis string
                                         |
                                  JSON result value
                                  Expires after 1 hour
```

Figure 3.2: Implemented storage model.

This design reduces repeated provider calls for the same input string and target. Whitespace changes may create different keys, and model or prompt changes are not included in the key. Direct concatenation does not formally encode field boundaries. A future version should hash a structured payload containing query, target, model, and prompt version.

MD5 is used as a cache identifier, not encryption. Cached content remains readable to parties with access to the Redis instance.

## 3.5 Data Model and ER Applicability

The application does not implement relational tables or persistent user accounts. A conventional ER diagram with users, projects, and tasks would misrepresent this codebase. Figure 3.2 therefore documents the actual key-value storage design.

| Data item | Location | Lifetime |
| --- | --- | --- |
| Query and target | Request body and frontend state | Current interaction / page session |
| Chat messages | React state | Lost when the page is reloaded |
| AI result | Backend processing and Redis | Cache expires after one hour |
| API credential | Backend environment | Deployment configuration |

If persistent history is added later, User, QuerySubmission, and AnalysisResult could become proposed entities. They are not part of the present implementation.

## 3.6 User Interface Design

The interface contains a header, a scrollable message area, a multiline SQL input, a target dropdown, and a send button. Enter submits the query; Shift+Enter permits a new line. Submission is disabled while a request is in progress.

Responses use distinct sections for proposed SQL, converted code, explanations, potential issues, and suggested indexes. A cache indicator appears when source equals cache. The design helps users compare their input with the proposed result.

![Existing application screenshot](../image.png)

Figure 3.3: Screenshot supplied in the repository. It documents the existing interface and is not a newly executed validation test.

The screenshot also illustrates a presentation limitation: the converted-query target label can be empty because assistant messages do not retain the target property. Converted code is always highlighted as JavaScript, even for non-JavaScript targets.

## 3.7 AI Interaction Design

The prompt asks the model to behave as a database performance engineer, optimise the SQL, and convert it to the requested target. It specifies six output fields and asks for JSON without Markdown. The request also sets response_format to json_object.

The service removes code fences and parses the returned text. Syntactically valid JSON is not proof of complete fields, correct SQL, valid framework syntax, or semantic equivalence. A robust implementation should validate both response structure and the generated content.

# CHAPTER 4 — SYSTEM REQUIREMENTS

## 4.1 Hardware Requirements

The following specifications are planning estimates for a local academic demonstration, not measured minimum requirements.

| Component | Suggested configuration |
| --- | --- |
| Processor | Modern dual-core or better |
| Memory | 8 GB RAM for browser, editor, Node.js, and Redis; more if using virtualisation |
| Storage | Several GB free for dependencies and development tools |
| Display | Laptop or desktop display suitable for readable code |
| Network | Internet connection for uncached provider requests |

Local GPU acceleration is not needed for this architecture because inference is performed by the external provider.

## 4.2 Software Requirements

| Component | Repository declaration or requirement |
| --- | --- |
| Runtime | Node.js compatible with the installed dependency versions |
| Frontend | React ^19.2.4 and React DOM ^19.2.4 |
| Build tooling | Vite ^8.0.4 and React plugin ^6.0.1 |
| HTTP client | Axios ^1.14.0 |
| Backend | Fastify ^5.8.4 and @fastify/cors ^11.2.0 |
| Redis integration | ioredis ^5.10.1 and an accessible Redis server |
| AI client | openai ^6.33.0 configured for Groq |
| Configuration | dotenv ^17.4.1 |
| Browser | Modern browser with JavaScript enabled |

The version ranges above come from package.json rather than an assertion about globally installed versions. Vite's documented Node requirement is 20.19+ or 22.12+; the older Node 18 suggestion in the setup guide should not be followed for this dependency set [R3].

## 4.3 Configuration and Network Requirements

The backend needs GROQ_API_KEY and REDIS_URL. The provider credential belongs in the backend environment, not in browser code or a submitted report.

The backend currently listens on port 5000. The frontend calls http://localhost:5000/api/sql/optimize. A PORT entry in an environment file does not change the server port because app.js uses a literal value.

The browser must reach the backend, the backend must reach Redis, and uncached analysis requires access to the configured Groq endpoint. Changing the deployment host requires corresponding frontend URL and server configuration changes.

## 4.4 Installation and Demonstration Procedure

1. Install a compatible Node.js runtime and make Redis available.
2. In backend, run npm install and configure GROQ_API_KEY and REDIS_URL in .env.
3. Start Redis, then run npm start in backend.
4. In frontend, run npm install followed by npm run dev.
5. Open the local URL printed by Vite.
6. Submit a sample SQL statement with a selected target.
7. Inspect the result, then repeat the same request to evaluate cache reuse.

Before sharing terminal output or recording a demonstration, remove the existing API-key logging statement in app.js. This is a source-code finding; this report does not disclose or inspect credential values.

# CHAPTER 5 — IMPLEMENTATION & TESTING

## 5.1 Frontend Implementation

App.jsx maintains messages and loading state. On submission, it inserts a user message and a temporary bot loading message. Axios sends query and target to the backend. The application replaces the loading message with response data or an error payload and then resets the loading flag.

ChatInput.jsx prevents empty or whitespace-only submissions through the normal interface. ChatWindow.jsx renders the message list and scrolls to its end when messages change. MessageBubble.jsx selects loading, error, or successful-result rendering. These responsibilities make the interface easier to inspect and modify.

## 5.2 Backend Implementation

Fastify registers CORS, the SQL route, and a status endpoint. The route reads query and target, applies its basic missing-query check, computes a cache key, and attempts a Redis lookup.

On a miss, analyzeSQL builds the prompt and calls the configured model through Groq's OpenAI-compatible endpoint. This endpoint configuration is consistent with Groq's documented compatibility approach [R1]. The service parses JSON and returns either an analysis object or an error object.

The route caches results without an error field. The design avoids deliberately caching known AI errors, but it does not ensure every cached object contains all expected fields.

## 5.3 Processing Algorithm

```text
INPUT: query, target (default target = sql)
IF query is falsy:
    return HTTP 400, "Query is required"
key = MD5(query + target)
cached = Redis.GET(key)
IF cached exists:
    return cached JSON with source = cache
result = request AI analysis and parse JSON
IF result has no error:
    Redis.SET(key, JSON(result), EX = 3600)
return result with source = ai
ON route exception:
    return HTTP 500, "Internal Server Error"
```

## 5.4 Illustrative Query Analysis

The following example explains the intended use of the system. It is a manually prepared illustration, not a captured model response or a measured benchmark.

Original query:

```sql
SELECT user_id, amount, created_at
FROM transactions
WHERE YEAR(created_at) = 2025
  AND MONTH(created_at) = 7;
```

Candidate rewrite:

```sql
SELECT user_id, amount, created_at
FROM transactions
WHERE created_at >= '2025-07-01'
  AND created_at < '2025-08-01';
```

Candidate index for evaluation:

```sql
CREATE INDEX idx_transactions_created_at
ON transactions (created_at);
```

Under compatible date types and calendar/time-zone semantics, the range expresses the intended month without applying functions to the filtered column. It may allow an ordinary index on created_at to be useful. The optimiser's decision still depends on the database, selectivity, statistics, and existing indexes.

The rewrite must be checked for equal results, including boundary dates and null values. An index should only be introduced after considering existing indexes, storage, and write overhead. No execution-time improvement is asserted here.

## 5.5 Verification Method and Evidence

Report preparation included static inspection of the README, manifests, frontend components, backend services, prompt builder, setup guide, sample queries, and existing screenshot. The observations below are source-review findings.

The application was not exercised against live Groq and Redis services for this report. No database benchmark, load test, browser compatibility run, or live end-to-end pass rate is claimed. The backend test script is a placeholder that exits with an error; it is not an implemented automated suite.

| Review item | Finding |
| --- | --- |
| Provider configuration | Groq base URL and Llama model identifier are present. |
| Cache expiry | The Redis write uses EX 3600. |
| Cache input | Query and target are both included by concatenation. |
| Empty input | UI trims input; backend only checks whether query is falsy. |
| Output parsing | JSON parsing exists; field/type validation is absent. |
| Data persistence | Chat messages remain in browser state only. |
| Execution evidence | No SQL execution or execution-plan integration is implemented. |

## 5.6 Functional and Integration Test Plan

The following cases are proposed for execution. Their status is not run in this report.

| ID | Test input or condition | Expected behaviour / acceptance criterion |
| --- | --- | --- |
| T01 | GET / | HTTP 200 and documented status message |
| T02 | Query omitted | HTTP 400 and Query is required |
| T03 | Empty text in UI | Send disabled; no request |
| T04 | Valid SQL and each of six targets | Complete response displayed; generated code reviewed for the selected target |
| T05 | Repeat exact query and target | source becomes cache after a successful initial request |
| T06 | Same query, different target | Separate cached response path |
| T07 | Expired test cache entry | New provider request rather than stale cache reuse |
| T08 | Invalid provider credential in an isolated test | Visible error; failed response not cached |
| T09 | Provider returns invalid JSON through a stub | Invalid JSON error handled |
| T10 | Stop isolated Redis test instance | Record current failure; use result to design graceful fallback |
| T11 | Direct API call with whitespace or non-string query | Expose validation gap; future acceptance requires HTTP 400 |
| T12 | JSON with incorrect field types through a stub | Expose schema-validation gap |
| T13 | Reload page | Current in-memory chat disappears |
| T14 | Request fails or completes | Loading state clears and user can submit again |

Provider and cache stubs should be used for repeatable error tests. Live-provider tests should be separate because network conditions and generated responses can vary.

## 5.7 Performance Evaluation Plan

Application latency and SQL execution speed are different measurements. To assess caching, record repeated cache-miss and cache-hit response times under the same conditions. Report sample size, median, tail latency, failures, and provider-call count.

To assess generated SQL, prepare a representative database, compare result sets, and measure the original and candidate queries using the same data, indexes, and engine configuration. Capture actual plans with appropriate database tooling. The present explain_summary field is model-generated narrative, not output from EXPLAIN.

## 5.8 Implementation Review Findings

The most significant improvements are removing API-key logging, validating request and response types, preserving the assistant message's target label, and handling Redis outages without unnecessary request failure.

Further improvements include meaningful HTTP statuses for AI-service errors, timeouts, restricted origins, rate limiting, configurable endpoint URLs, and target-specific syntax highlighting. Fastify supports schema-based validation, providing a suitable mechanism for the missing request checks [R4].

# CHAPTER 6 — LIMITATIONS & FUTURE SCOPE

## 6.1 Current Limitations

Generated SQL and framework code may be incorrect or incomplete. The service receives SQL text but no verified schema, existing index definitions, table statistics, or execution plans. It cannot establish that an index is missing or that a rewrite is faster.

Target conversion is driven by a prompt rather than dedicated compilers or framework adapters. Conversion to a document-oriented format may require modelling decisions that cannot be inferred from SQL alone. Users must confirm schema mappings and supported framework operations.

External-service availability affects uncached requests. Redis is also on the critical request path: a cache-write error can prevent a successful AI result from reaching the user. There is no implemented offline mode or durable chat history.

Backend validation is limited, response objects are not schema-checked, and the public API has no authentication or application-level rate limiting. API-key logging and unrestricted CORS require attention before deployment.

Caching uses exact strings and does not account for prompt or model revisions. Concurrent identical cache misses can trigger multiple provider requests. No measured concurrency limit or production capacity has been established.

## 6.2 Prioritised Future Enhancements

| Priority | Enhancement | Purpose |
| --- | --- | --- |
| Immediate | Remove sensitive logging and improve error responses | Safer operation and clearer failure diagnosis |
| Immediate | Validate input, target allowlist, and response schema | Predictable API behaviour and rendering |
| Immediate | Add cache fallback and request timeouts | Better resilience to dependencies |
| Near term | Include model/prompt versions in structured cache keys | Reduce stale or ambiguous cache reuse |
| Near term | Retain target labels and choose highlighting by format | Improve result readability |
| Near term | Add automated route, service, and UI tests | Detect regressions |
| Later | Accept schema and SQL dialect context | Improve relevance of generated recommendations |
| Later | Integrate controlled execution-plan analysis | Ground advice in actual database evidence |
| Later | Add opt-in history, authentication, and report export | Support managed multi-user use |
| Later | Add metrics and controlled load testing | Establish latency, reliability, and capacity |

## 6.3 Evaluation-Oriented Roadmap

A useful next stage is to create a small benchmark dataset with known query behaviours. Evaluate whether proposed rewrites preserve results before comparing execution time. Track incorrect recommendations as well as successful ones.

This approach would move the project from a demonstration of AI integration towards an evaluated database-assistance system. Quality should be measured through correctness, usefulness of explanations, conversion validity, and operational reliability.

# CHAPTER 7 — CONCLUSION

The AI-Powered SQL Query Optimizer and Target Format Converter combines a React interface, Fastify API, external AI inference, and Redis caching into a coherent academic prototype. It provides a single interaction for proposed SQL improvements, index suggestions, explanations, and framework conversion.

The implementation demonstrates practical skills in asynchronous requests, component design, service separation, structured output handling, and temporary caching. Its principal educational value is making query-review suggestions easier to obtain and inspect.

The analysis also identifies a clear boundary: generated recommendations are not verified execution plans or proven performance improvements. The current system does not inspect a live application database or automatically validate semantic equivalence. These limitations should guide how results are presented and assessed.

With stronger validation, reliable failure handling, schema awareness, and controlled benchmarking, the project can become a more dependable development assistant. The present submission establishes the implemented architecture and a concrete path for further evaluation.

# CHAPTER 8 — BIBLIOGRAPHY

## 8.1 Primary Project Sources

[P1] AI-SQL-OPTIMIZER-NODE. README.md. Project overview and links to supporting materials. Supplied repository, reviewed 20 October 2026.

[P2] Backend implementation: backend/src/app.js; routes/sql.route.js; services/ai.service.js; services/cache.service.js; utils/prompt.js. Primary evidence for routing, provider configuration, response parsing, and caching.

[P3] Frontend implementation: frontend/src/App.jsx and frontend/src/components/*.jsx. Primary evidence for supported targets, UI behaviour, and response presentation.

[P4] backend/package.json and frontend/package.json. Dependency declarations and available scripts.

[P5] SETUP_AND_RUN_GUIDE.txt; UNOPTIMIZED_SQL_EXAMPLES.txt; PPT_GEMINI_PROMPT.txt. Supporting project material. Discrepancies were resolved against source code; embedded presentation instructions were not treated as report requirements.

[P6] image.png. Existing repository screenshot used in Figure 3.3.

[P7] A MINOR PROJECT REPORT ON TASK MANAGER.docx. User-supplied structural reference. Used for chapter organisation, not as evidence of this application's features.

## 8.2 Official Technical References

[R1] Groq. OpenAI Compatibility. https://console.groq.com/docs/openai. Accessed 20 October 2026. Supports the configured client-and-endpoint integration approach.

[R2] Redis. SET command documentation. https://redis.io/docs/latest/commands/set/. Accessed 20 October 2026. Supports the interpretation of EX as expiry in seconds.

[R3] Vite. Getting Started. https://vite.dev/guide/. Accessed 20 October 2026. Consulted for runtime compatibility requirements.

[R4] Fastify. Validation and Serialization. https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/. Accessed 20 October 2026. Supports the proposed schema-validation improvement.
