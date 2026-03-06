# AI-Assisted Development Guidelines for Enterprise Applications

**Document Classification:** Internal — Technical Leadership & Management
**Version:** 1.0
**Date:** March 2026
**Prepared By:** Enterprise Architecture & AI Engineering
**Audience:** Technical Leadership, Enterprise Architects, Engineering Management, Compliance & Security Teams

---

## Table of Contents

1. [Overview of AI-Assisted Development](#1-overview-of-ai-assisted-development)
2. [Code Quality Standards](#2-code-quality-standards)
3. [Enterprise-Grade Capabilities of Claude Code Generated Applications](#3-enterprise-grade-capabilities-of-claude-code-generated-applications)
4. [Use of Loveable for UI Prototyping](#4-use-of-loveable-for-ui-prototyping)
5. [Risk Assessment of AI-Generated Code](#5-risk-assessment-of-ai-generated-code)
6. [Production Support Strategy](#6-production-support-strategy)
7. [Bug Handling Strategy After Production Deployment](#7-bug-handling-strategy-after-production-deployment)
8. [Governance Model for AI-Assisted Development](#8-governance-model-for-ai-assisted-development)

---

## 1. Overview of AI-Assisted Development

### 1.1 What Is AI-Assisted Development?

AI-assisted development refers to the integration of large language model (LLM)-powered tools into the software development lifecycle (SDLC) to augment developer productivity, accelerate delivery, and improve consistency. Tools such as **Claude Code** (developed by Anthropic) operate as intelligent engineering collaborators capable of reading, writing, refactoring, debugging, and reviewing code across the full application stack.

Unlike traditional code generation tools or simple autocomplete engines, modern AI coding assistants like Claude Code reason contextually over entire codebases, understand architectural constraints, propose solutions consistent with existing patterns, and explain trade-offs at a level appropriate for experienced engineers.

### 1.2 Role of Claude Code in the Development Lifecycle

Claude Code participates in the SDLC at multiple stages:

| SDLC Phase | Claude Code Contribution |
|---|---|
| **Requirements Analysis** | Translates business requirements into technical specifications and data models |
| **Architecture Design** | Proposes and evaluates architectural patterns (microservices, event-driven, layered) |
| **Implementation** | Generates production-quality code with tests, error handling, and documentation |
| **Code Review** | Identifies anti-patterns, security vulnerabilities, and deviations from standards |
| **Testing** | Writes unit, integration, and end-to-end test suites |
| **Debugging** | Diagnoses runtime errors and traces root causes across call stacks |
| **Documentation** | Produces inline comments, API documentation, and architectural decision records |
| **Refactoring** | Modernises legacy code while preserving functional behaviour |
| **DevOps & CI/CD** | Generates pipeline configurations, Dockerfiles, and infrastructure-as-code |

### 1.3 Strategic Value for Enterprise Development

- **Velocity:** AI assistance compresses development timelines significantly without sacrificing quality when governed correctly.
- **Consistency:** AI tools apply the same coding standards uniformly across all modules, reducing stylistic drift between developers.
- **Knowledge Amplification:** Junior developers gain access to senior-level patterns and practices embedded in AI recommendations.
- **Risk Reduction:** Proactive identification of security vulnerabilities, anti-patterns, and missing error handling during development rather than post-deployment.
- **Cost Efficiency:** Reduction in rework cycles, manual code reviews, and late-stage defect remediation.

> **Management Takeaway:** AI-assisted development is not a replacement for software engineers. It is a force multiplier. Human engineers remain responsible for architecture decisions, business logic validation, security governance, and code approval. Claude Code accelerates the mechanical aspects of software construction while humans retain full ownership of quality, correctness, and compliance.

---

## 2. Code Quality Standards

Code quality is not binary — it exists on a spectrum. In enterprise software, particularly systems that handle sensitive production data, understanding and enforcing code quality is a fundamental risk management obligation. Below are three classifications of code quality with their characteristics, risks, and relevance to AI-assisted development.

---

### 2.1 Good Code

#### Characteristics

- **Readable and Self-Documenting:** Variable names, function names, and class names clearly communicate intent. A developer unfamiliar with the module can understand it within minutes.
- **Single Responsibility:** Each function, class, and module has one clearly defined purpose and does it well.
- **Testable:** Logic is decoupled from infrastructure concerns (database, network, file system), making it straightforward to write unit tests with high coverage.
- **Secure by Design:** Input validation, output encoding, parameterised queries, and principle of least privilege are applied consistently and proactively.
- **Maintainable:** Changes can be made in one place without causing cascading failures. Dependencies are explicit and minimal.
- **Consistent:** Follows team-agreed coding standards, linting rules, and architectural conventions throughout the codebase.
- **Error Handling:** Exceptions and error states are handled gracefully. Errors are logged with sufficient context for diagnosis without exposing sensitive data.
- **Performant:** Algorithms and data structures are chosen appropriately for the use case. Database queries are optimised and indexed.

#### Risks

- Good code requires investment of time and discipline. In high-pressure delivery environments, there is risk of shortcuts being taken that gradually degrade quality.
- Good code today can become technical debt tomorrow if the surrounding architecture evolves without the module being updated.

#### Example Scenario

A policy management API endpoint that validates all incoming request fields against a schema, enforces JWT-based authentication, performs parameterised database queries, logs all state changes to an audit trail, and returns standardised error responses. Every function has a clear name, is under 30 lines, and has corresponding unit tests with 90%+ coverage.

#### How Claude Code Enforces This

- Generates code that adheres to SOLID principles by default when sufficient context is provided.
- Automatically includes input validation using established libraries (e.g., Zod, Joi, class-validator).
- Proposes and writes unit tests as part of the implementation task.
- Flags violations of best practices when reviewing existing code and suggests refactored alternatives.

---

### 2.2 Bad Code

#### Characteristics

- **Unclear Intent:** Variable names such as `x`, `temp`, `data2`, or function names such as `doStuff()` that provide no semantic meaning.
- **Long Methods / God Classes:** Single functions that span hundreds of lines performing multiple unrelated operations. Classes that accumulate unrelated responsibilities over time.
- **No Error Handling:** Operations that can fail (API calls, database queries, file I/O) are executed without try/catch blocks or fallback logic, causing unhandled runtime exceptions.
- **Hardcoded Values:** Credentials, URLs, configuration parameters, and magic numbers embedded directly in source code rather than externalised to configuration or secret stores.
- **Code Duplication:** The same logic copy-pasted across multiple locations. When a bug is found in one copy, others are missed, leading to inconsistent behaviour.
- **No Tests:** Modules that are shipped without any automated test coverage, making regression detection entirely dependent on manual testing.
- **Tight Coupling:** Business logic, database access, and presentation logic intermingled in the same class or function with no separation of concerns.

#### Risks

- **Security Vulnerabilities:** Hardcoded credentials, missing input validation, and absent error handling are direct pathways to SQL injection, XSS, credential leakage, and denial-of-service vulnerabilities.
- **Maintenance Burden:** Every change requires a developer to read and understand opaque, duplicated logic before modifying it, dramatically increasing the time and cost of enhancements and bug fixes.
- **Regression Risk:** Without tests, changes that break existing functionality are detected only in production, increasing the blast radius of bugs.
- **Incident Resolution Time:** When production incidents occur, bad code is significantly harder to diagnose and fix under pressure, extending mean time to recovery (MTTR).
- **Knowledge Dependency:** When the original developer leaves, bad code becomes an organisational liability because no one else can understand or safely modify it.

#### Example Scenario

A claims processing function that connects directly to a database using a hardcoded password, executes a dynamically constructed SQL string using unvalidated user input (SQL injection risk), returns raw database error messages to the client (information disclosure), has no logging, and is called by 12 different parts of the application with no abstraction layer. Changing the database schema requires modifying all 12 call sites.

#### How Claude Code Helps

- Claude Code is trained to avoid generating code with these anti-patterns. When directed to write production code, it applies separation of concerns, parameterised queries, and externalised configuration.
- When reviewing existing bad code, Claude Code identifies anti-patterns and proposes refactored alternatives.
- However, Claude Code must be provided with appropriate context and constraints — if asked to produce a quick prototype without quality guidelines, it will optimise for brevity rather than production readiness.

---

### 2.3 Ugly Code

#### Characteristics

Ugly code is technically functional but structurally problematic. It is the category most often produced under time pressure when developers prioritise working code over well-structured code. It lies on the spectrum between bad and good.

- **Inconsistent Formatting:** Mixed indentation styles, inconsistent naming conventions (camelCase mixed with snake_case), and varying brace placement within the same codebase.
- **Commented-Out Dead Code:** Blocks of commented-out code left in place because developers are uncertain whether they may be needed again, creating noise and confusion.
- **Over-Engineered Abstractions:** Unnecessary inheritance hierarchies, abstract base classes with a single concrete implementation, or complex design patterns applied to trivially simple problems.
- **Under-Engineered Solutions:** The opposite — complex logic handled with deeply nested if/else chains or lengthy switch statements where a well-designed abstraction would be cleaner.
- **Inconsistent Error Handling:** Some paths handle errors, others do not. Error messages are inconsistent in format and level of detail.
- **Mixed Concerns:** Business logic partially separated from infrastructure, but with occasional direct database calls embedded in service-layer code.
- **Technical Debt Comments:** TODO, FIXME, and HACK comments scattered throughout the codebase indicating known issues that were never addressed.

#### Risks

- **Maintainability Decay:** Ugly code is a gateway to bad code. As it grows without refactoring, complexity accumulates until the codebase becomes difficult to reason about.
- **Onboarding Friction:** New developers take longer to become productive when they must decipher inconsistent patterns across the codebase.
- **Bug Concealment:** Inconsistent formatting and mixed concerns make bugs harder to spot during code review.
- **Velocity Reduction:** Over time, ugly codebases slow delivery as developers spend increasing proportions of their time understanding existing code rather than writing new features.

#### Example Scenario

A billing module that works correctly but uses four different naming conventions, contains 200-line functions with 6 levels of nesting, has 40 lines of commented-out experimental code, and alternates between two different error-handling approaches depending on which developer wrote each section. It passes all tests but takes a new developer three days to understand well enough to safely modify.

#### How Claude Code Helps

- When generating code, Claude Code applies consistent formatting and naming conventions aligned with project standards.
- When reviewing ugly code, Claude Code identifies inconsistencies, proposes normalised naming conventions, and suggests refactoring strategies to reduce complexity.
- Claude Code can be used specifically as a refactoring tool in a dedicated sprint to systematically clean up ugly code, reducing technical debt without changing functionality.

---

### 2.4 Summary: Code Quality Comparison

| Dimension | Good Code | Bad Code | Ugly Code |
|---|---|---|---|
| Readability | High | Low | Medium |
| Testability | High | Low | Medium |
| Security | Built-in | Absent | Inconsistent |
| Maintainability | High | Low | Declining |
| Onboarding Ease | Easy | Difficult | Difficult |
| Production Risk | Low | High | Medium-High |
| AI-Assisted Remediation | Maintain & extend | Refactor immediately | Systematic clean-up |

---

## 3. Enterprise-Grade Capabilities of Claude Code Generated Applications

Enterprise software must meet a higher standard than prototypes or internal tools. It must be secure, scalable, compliant, and operable at production scale with sensitive data. The following sections explain how AI-assisted development with Claude Code supports each of these dimensions.

---

### 3.1 Security

#### 3.1.1 Secure Coding Practices

Claude Code applies secure coding practices as a baseline when generating production-grade code:

- **Input Validation:** All data entering the system from external sources (user input, API payloads, file uploads) is validated against strict schemas before processing. Libraries such as Zod (TypeScript) or Pydantic (Python) are used to enforce type safety and value constraints.
- **Output Encoding:** Data rendered to UI or returned in API responses is properly encoded to prevent Cross-Site Scripting (XSS) and injection attacks.
- **Parameterised Queries:** Database operations use prepared statements or ORM-level parameterisation, eliminating SQL injection vulnerabilities.
- **Secret Management:** Credentials, API keys, and connection strings are never hardcoded. They are externalised to environment variables or vault-based secret stores (e.g., AWS Secrets Manager, HashiCorp Vault, Azure Key Vault).
- **Principle of Least Privilege:** Application service accounts and database users are granted only the minimum permissions required for their function.
- **Dependency Security:** Dependencies are pinned to specific versions and regularly scanned using tools such as `npm audit`, `pip-audit`, or Snyk to detect known vulnerabilities.

#### 3.1.2 OWASP Standards

Claude Code-generated applications address the OWASP Top 10 security risks as a standard practice:

| OWASP Risk | Mitigation Applied |
|---|---|
| A01 Broken Access Control | Role-based access control (RBAC) middleware, JWT validation, resource-level ownership checks |
| A02 Cryptographic Failures | TLS enforced for all transport, strong hashing (bcrypt/Argon2) for passwords, AES-256 for data at rest |
| A03 Injection | Parameterised queries, schema validation, ORM usage |
| A04 Insecure Design | Security requirements modelled during design phase, threat modelling applied |
| A05 Security Misconfiguration | Secure defaults, no debug modes in production, security headers via Helmet.js |
| A06 Vulnerable Components | Dependency scanning in CI/CD pipeline, automated alerts for CVEs |
| A07 Auth & Session Failures | JWT with short expiry, refresh token rotation, brute force protection |
| A08 Software Integrity Failures | Signed commits, verified package checksums, supply chain scanning |
| A09 Logging & Monitoring Failures | Centralised structured logging, audit trails, real-time alerting |
| A10 SSRF | Allowlisted outbound URLs, request validation for server-side HTTP calls |

#### 3.1.3 Authentication and Authorisation

- **Authentication:** JWT-based stateless authentication with configurable expiry windows. Refresh token rotation to limit session hijacking risk. Multi-factor authentication (MFA) integration via TOTP or FIDO2 for privileged accounts.
- **Authorisation:** Granular Role-Based Access Control (RBAC) enforced at the API middleware layer. Permissions are defined at both the endpoint level and the data-attribute level. No client-side authorisation logic — all decisions are server-side.
- **Session Management:** Secure, HttpOnly, SameSite cookies where applicable. CSRF tokens for state-changing operations. Automatic session expiry with configurable idle timeout.

#### 3.1.4 Data Protection

- **Encryption in Transit:** All communications between clients, services, and databases use TLS 1.2 or higher. Internal service-to-service communication within the cluster uses mTLS where feasible.
- **Encryption at Rest:** Sensitive fields (PII, financial data, policy details) are encrypted at the database level using AES-256. Database storage volumes are encrypted.
- **Data Masking:** PII data is masked in logs, API responses to non-privileged roles, and test environments. Production data is never used in non-production environments without anonymisation.
- **Retention Policies:** Data retention is enforced programmatically, with automated purge jobs aligned to regulatory requirements.

#### 3.1.5 Secure API Design

- **API Versioning:** All endpoints are versioned (`/api/v1/`, `/api/v2/`) to allow breaking changes to be introduced without disrupting existing integrations.
- **Rate Limiting:** Per-user and per-IP rate limiting enforced at the API gateway level to prevent abuse and denial-of-service.
- **Input Size Limits:** Request payload size limits enforced to prevent memory exhaustion attacks.
- **CORS Policy:** Strict Cross-Origin Resource Sharing policies applied, with an explicit allowlist of trusted origins.
- **API Gateway Security:** All external traffic routes through an API gateway that handles authentication, rate limiting, logging, and threat detection before reaching application services.

---

### 3.2 Scalability

#### 3.2.1 Microservices Readiness

Claude Code-generated applications are structured to support decomposition into microservices when the scale of the system justifies it:

- **Domain-Driven Design (DDD):** Business domains (e.g., Policy Management, Claims, Billing, Underwriting) are modelled as bounded contexts with clear interface contracts, enabling them to be deployed as independent services.
- **Loose Coupling:** Services communicate through well-defined interfaces. There are no direct cross-domain database calls — all cross-domain data access is through service APIs or event streams.
- **Independent Deployability:** Each service can be built, tested, deployed, and scaled independently without requiring coordinated releases with other services.

#### 3.2.2 Horizontal Scalability

- **Stateless Services:** Application instances carry no user session state. All state is stored externally (database, cache), allowing any instance to serve any request.
- **Load Balancing:** Traffic is distributed across multiple application instances using load balancers. Health checks ensure traffic is only routed to healthy instances.
- **Database Scalability:** Read replicas for high-volume read workloads. Sharding strategies defined for tables with very high write volumes. Connection pooling to prevent connection exhaustion under load.
- **Caching Layer:** Redis or equivalent caching layer for frequently accessed, low-volatility data (reference data, product configurations, user permissions).

#### 3.2.3 Cloud-Native Architecture

- **Infrastructure as Code (IaC):** All infrastructure is defined in code (Terraform, AWS CloudFormation, or Pulumi), version-controlled, and deployed through automated pipelines.
- **Managed Services:** Database, caching, message queuing, and secret management are provided by managed cloud services, reducing operational overhead and improving reliability.
- **Auto-Scaling:** Application services are configured with horizontal pod autoscaling (HPA) in Kubernetes or equivalent, scaling out under load and scaling in during quiet periods to control cost.
- **Multi-Region:** Critical production systems are deployable across multiple geographic regions for disaster recovery and low-latency access.

#### 3.2.4 Containerisation Readiness

- **Docker:** All application services are packaged as Docker images with minimal, security-hardened base images (e.g., `node:alpine`, `python:slim`).
- **Kubernetes:** Deployment manifests, services, ingress resources, config maps, and secrets are defined as Kubernetes YAML manifests, ready for deployment to any Kubernetes-compatible cluster (EKS, AKS, GKE).
- **Twelve-Factor Compliance:** Applications adhere to the Twelve-Factor App methodology, separating configuration from code, externalising state, and supporting environment-specific configuration through environment variables.

#### 3.2.5 Performance Considerations

- **Database Query Optimisation:** ORM-generated queries are reviewed and optimised. Indexes are created based on query patterns identified during development.
- **Asynchronous Processing:** Long-running operations (report generation, batch processing, document generation) are offloaded to background job queues to prevent blocking API responses.
- **Pagination:** All list endpoints return paginated results with configurable page sizes to prevent large data loads from degrading performance.
- **Response Compression:** HTTP response compression (gzip/brotli) is enabled to reduce bandwidth consumption.

---

### 3.3 Compliance

#### 3.3.1 Handling Sensitive Production Data

- **Data Classification:** All data processed by the application is classified according to sensitivity (Public, Internal, Confidential, Restricted). Access controls, encryption requirements, and retention policies are applied per classification.
- **PII Handling:** Personally identifiable information is processed only where necessary and protected through access controls, encryption, and audit logging. PII is never written to application logs in plain text.
- **Data Minimisation:** Only the data required for a specific function is collected, processed, and stored. Unnecessary data fields are not retained.

#### 3.3.2 Logging and Auditing

- **Application Logs:** Structured JSON logging (using Winston, Pino, or equivalent) captures event type, timestamp, user identity, resource affected, and outcome. Logs are shipped to a centralised logging platform (e.g., Elasticsearch/OpenSearch, Splunk, AWS CloudWatch).
- **Audit Trail:** Every state-changing operation on sensitive entities (policy creation, claim status updates, payment processing) generates an immutable audit log entry recording who did what, when, and from which IP address. Audit logs are stored separately from application logs and protected from modification.
- **Access Logs:** All API access is logged at the gateway level, including authenticated user identity, endpoint, method, request size, response code, and response time.
- **Log Retention:** Log retention periods are configured in alignment with regulatory requirements (e.g., 7 years for financial records, 3 years for operational logs).

#### 3.3.3 Data Governance

- **Data Lineage:** The flow of sensitive data through the system is documented and traceable, from ingestion through processing to storage and eventual deletion.
- **Consent Management:** Where applicable (e.g., GDPR), user consent for data processing is recorded and enforceable, with mechanisms for consent withdrawal.
- **Right to Erasure:** Data deletion workflows are implemented to support regulatory obligations for personal data erasure.
- **Data Residency:** Data is stored in geographically appropriate regions in compliance with data sovereignty requirements.

#### 3.3.4 Regulatory Considerations

The application is designed to support compliance with the following regulatory frameworks, depending on the applicable jurisdiction:

- **GDPR (General Data Protection Regulation):** Data subject rights, consent management, privacy by design, data breach notification.
- **POPIA (Protection of Personal Information Act):** South African personal data protection obligations, information officer accountability.
- **PCI-DSS:** Secure handling of payment card data, encrypted storage and transmission, access controls.
- **SOC 2:** Security, availability, confidentiality, processing integrity, and privacy controls.
- **ISO 27001:** Information security management system (ISMS) alignment.

#### 3.3.5 Secure Deployment Practices

- **Environment Separation:** Strict separation between development, testing, staging, and production environments. No shared credentials or infrastructure across environments.
- **Secrets in Vaults:** All production credentials and certificates are stored in dedicated secret management services and injected at runtime. They never appear in source code or deployment scripts.
- **Immutable Deployments:** Deployments replace instances rather than updating them in place (immutable infrastructure). This ensures consistency and enables reliable rollback.
- **Security Scanning in CI/CD:** Every build pipeline includes SAST (Static Application Security Testing) and container image vulnerability scanning before code reaches production.

---

## 4. Use of Loveable for UI Prototyping

### 4.1 What Are UI Prototyping Tools?

UI prototyping tools such as **Loveable** (formerly GPT Engineer), **v0 by Vercel**, and **Bolt** are AI-powered rapid application development environments designed to transform natural language descriptions into functional user interface code at exceptional speed. These tools generate React, HTML/CSS, and sometimes basic backend scaffolding in minutes, allowing designers and product managers to produce visual, interactive prototypes without requiring deep software engineering expertise.

Their primary purpose is **communication and validation** — they enable teams to rapidly visualise product ideas, gather stakeholder feedback, and iterate on user experience before investing in production engineering effort.

### 4.2 What Prototyping Tools Are Used For

- **Stakeholder Demonstrations:** Quickly build a clickable, visual representation of a product concept to facilitate business discussions without building real functionality.
- **User Experience Validation:** Test navigation flows, layout decisions, and feature interactions with end users before committing to a technical implementation.
- **Requirements Clarity:** Use a tangible prototype to surface missing requirements, ambiguities, and design conflicts early in the project lifecycle.
- **Design Handoff:** Provide design references to engineering teams as a starting point for UI development.
- **Investor and Client Presentations:** Produce polished-looking demonstrations of proposed products for sales and fundraising purposes.

### 4.3 Difference Between Prototype Code and Production-Grade Code

This distinction is critical and must be clearly understood by all stakeholders:

| Dimension | Prototype Code (Loveable) | Production-Grade Code |
|---|---|---|
| **Purpose** | Demonstrate concept, gather feedback | Serve real users with real data |
| **Security** | None — no authentication, no validation | Comprehensive — OWASP-compliant |
| **Data** | Mock/hardcoded | Live, encrypted, governed |
| **Error Handling** | Minimal or absent | Comprehensive, with logging |
| **Testing** | None | Unit, integration, E2E test suites |
| **Scalability** | Single-user, no concurrency consideration | Horizontally scalable, load-tested |
| **Code Quality** | Exploratory, inconsistent | Reviewed, standards-compliant |
| **Architecture** | Monolithic, tightly coupled | Layered, microservices-ready |
| **Auditability** | None | Full audit trail |
| **DevOps** | None | Full CI/CD pipeline |
| **Compliance** | None | Regulatory-aligned |
| **Maintainability** | Low — built for speed | High — built for longevity |

> **Critical Guidance for Management:** Prototype code from Loveable should never be promoted directly to production. It is a design artefact, not a deployable product. Using prototype code with production data represents an unacceptable security and compliance risk.

### 4.4 Can the Prototype Be Enhanced Into an Enterprise-Grade System?

**Yes, with a structured transformation programme.** The prototype serves as a valuable reference for:

- Visual design and user experience decisions already validated by stakeholders
- Feature scope and navigation flow that has been agreed upon
- A communication artefact that reduces ambiguity in requirements

However, the underlying code must be treated as a **blueprint**, not a **foundation**. The recommended approach is to use the prototype as a functional specification and rebuild the application on an enterprise-grade technical foundation.

### 4.5 Steps to Transform the Prototype into a Production-Ready Application

#### Step 1: Architecture Redesign

- **Define the target architecture:** Layered architecture (presentation, application, domain, infrastructure) or microservices architecture based on scale requirements.
- **Define domain boundaries:** Identify bounded contexts (Policy, Claims, Billing, Underwriting, Customer Management) and design the interaction model between them.
- **Design the data model:** Replace any hardcoded or mock data structures with a normalised, properly indexed relational or document database schema.
- **API contract design:** Define RESTful or GraphQL API contracts with versioning, authentication, and documentation (OpenAPI/Swagger).
- **Infrastructure design:** Define cloud infrastructure, networking, security groups, and deployment topology using Infrastructure as Code.

#### Step 2: Security Hardening

- **Implement authentication:** JWT-based authentication with refresh token rotation, or integrate with enterprise SSO (SAML, OIDC) using providers such as Okta, Azure AD, or Auth0.
- **Implement authorisation:** Design and implement a granular RBAC model aligned with business roles.
- **Apply input validation:** All API endpoints enforce schema validation for incoming data.
- **Secrets management:** All credentials and sensitive configuration moved to vault-based secret management.
- **Security headers:** Apply HTTP security headers (Content Security Policy, HSTS, X-Frame-Options) via middleware.
- **Penetration testing:** Conduct a security assessment of the application before production launch.

#### Step 3: Backend Integration

- **Replace mock data with real persistence:** Connect to production database with parameterised queries or a well-tested ORM.
- **Implement business logic layer:** Move all business rules from frontend or prototype scaffolding into a proper service layer on the backend.
- **Integrate external systems:** Connect to third-party services (payment gateways, document management, notification services) through properly abstracted integration adapters.
- **Implement asynchronous workflows:** Background job processing for email notifications, report generation, and batch operations.

#### Step 4: Code Refactoring

- **Decompose monolithic components:** Break large, multi-purpose UI components into focused, reusable components.
- **Apply consistent naming conventions and formatting:** Enforce linting rules (ESLint, Prettier) across the entire codebase.
- **Remove hardcoded values:** Replace all magic numbers, hardcoded URLs, and static configurations with environment-driven configuration.
- **Eliminate dead code:** Remove commented-out code, unused imports, and unreachable branches.
- **Apply SOLID principles:** Ensure single responsibility, open/closed, and dependency inversion principles are applied throughout the service layer.

#### Step 5: Performance Optimisation

- **Frontend optimisation:** Code splitting, lazy loading, image optimisation, bundle size analysis, and caching strategies.
- **Backend optimisation:** Database query analysis, index creation, connection pooling, response caching.
- **Load testing:** Simulate production-level traffic volumes using tools such as k6, Locust, or JMeter to identify and resolve bottlenecks before go-live.
- **CDN integration:** Static assets served from a Content Delivery Network for global performance.

#### Step 6: Testing Framework

- **Unit tests:** Test every service function and utility in isolation using Jest, Vitest, or pytest, targeting 80%+ code coverage.
- **Integration tests:** Test interactions between services, repositories, and external APIs.
- **End-to-end tests:** Simulate complete user journeys using Playwright or Cypress to validate that the full application stack behaves correctly.
- **Security tests:** Automated security scanning integrated into the test suite using OWASP ZAP or equivalent.
- **Performance tests:** Load and stress tests run as part of the pre-release validation process.

#### Step 7: DevOps Pipeline

- **Version control governance:** Git branching strategy (GitFlow or trunk-based development), branch protection rules, required code reviews before merge.
- **CI pipeline:** Automated pipeline runs on every pull request: lint, unit tests, integration tests, security scan, build.
- **CD pipeline:** Automated deployment to staging on merge to main branch. Production deployment requires explicit approval gate.
- **Containerisation:** Application packaged as Docker images, deployed via Kubernetes or a managed container service.
- **Monitoring and alerting:** Application performance monitoring (APM) integrated from day one (Datadog, New Relic, AWS CloudWatch).
- **Infrastructure as Code:** All cloud resources defined in Terraform or equivalent, version-controlled and deployed through the pipeline.

---

## 5. Risk Assessment of AI-Generated Code

### 5.1 Identified Risks

#### 5.1.1 Code Quality Inconsistency

**Risk:** AI tools generate code that varies in quality depending on the specificity and clarity of the instructions provided. Without consistent prompting standards, generated code may vary significantly in structure, naming conventions, and adherence to architectural patterns across the codebase.

**Impact:** Maintenance complexity, inconsistent behaviour, increased debugging time.

#### 5.1.2 Dependency Risks

**Risk:** AI tools may recommend or generate code that relies on third-party dependencies that are outdated, unmaintained, have known vulnerabilities, or introduce unnecessary transitive dependencies.

**Impact:** Security vulnerabilities from unpatched dependencies, licensing compliance risks, build failures due to deprecated packages.

#### 5.1.3 Security Vulnerabilities

**Risk:** Without appropriate context and security-focused prompting, AI tools may generate code that omits security controls such as input validation, authentication checks, or proper error handling. AI tools also cannot fully evaluate the security implications of the specific business domain and data sensitivity.

**Impact:** Potential exposure of sensitive data, authentication bypass, injection vulnerabilities.

#### 5.1.4 Lack of Architecture Discipline

**Risk:** AI-generated code may not naturally respect the defined architectural boundaries of the application. Without explicit constraints, the AI may introduce direct database calls in the wrong layer, tightly couple modules that should be independent, or bypass established patterns.

**Impact:** Technical debt accumulation, reduced testability, difficulty scaling or refactoring.

#### 5.1.5 Hallucination and Incorrect Logic

**Risk:** LLMs can generate code that appears syntactically correct and logically plausible but contains subtle logical errors, incorrect business rule implementations, or references to non-existent APIs.

**Impact:** Incorrect data processing, data integrity issues, potential regulatory violations if business rules are misimplemented.

---

### 5.2 Risk Mitigation Strategy

#### 5.2.1 Code Review — Mandatory Human Oversight

Every AI-generated code change must be reviewed and approved by a qualified human engineer before being merged to any protected branch. Code reviewers assess:

- Correctness of business logic relative to requirements
- Adherence to the defined architectural patterns
- Security posture — presence of required controls
- Test coverage adequacy
- Absence of hardcoded secrets or sensitive data

#### 5.2.2 Static Analysis (SAST)

Static Application Security Testing tools are integrated into the CI/CD pipeline and run automatically on every code change:

- **SonarQube / SonarCloud:** Code quality gates enforce minimum standards for complexity, duplication, and security hotspots. Pull requests that fail quality gates are blocked from merging.
- **ESLint / TypeScript Strict Mode:** Type safety and linting rules catch common programming errors at the editor and CI pipeline level.
- **Semgrep:** Security-focused static analysis that identifies security anti-patterns specific to the technologies used.

#### 5.2.3 Dependency Scanning

- **npm audit / pip-audit / Dependabot:** Automated scanning of all dependencies for known CVEs. Critical vulnerabilities block the build pipeline.
- **Software Bill of Materials (SBOM):** An SBOM is generated for each release, providing a complete inventory of all software components and their versions.
- **License compliance:** Dependencies are scanned for license types that may conflict with commercial software distribution.

#### 5.2.4 Dynamic Security Scanning (DAST)

- **OWASP ZAP / Burp Suite:** Automated dynamic security scanning runs against the staging environment on each release to detect runtime security vulnerabilities that static analysis cannot identify.

#### 5.2.5 Architecture Governance

- **Architecture Decision Records (ADRs):** All significant architectural decisions are documented as ADRs and stored in the repository. These provide Claude Code with explicit context about established patterns.
- **Architecture Review Board:** Changes that significantly affect system architecture require review and sign-off from the architecture team before implementation.
- **Coding Standards Document:** A maintained coding standards document is shared with the AI assistant as context, ensuring generated code aligns with established conventions.
- **Linting and Formatting Enforcement:** Automated linting and formatting checks run in pre-commit hooks and CI pipelines, preventing non-compliant code from being committed.

---

## 6. Production Support Strategy

### 6.1 Strategy When AI Tools Are Not Used

If AI coding assistants are not available or not used during future support and maintenance phases, the following strategy ensures continued effective operation of the production system.

#### 6.1.1 Traditional Developer-Led Debugging

- Dedicated production support engineers are assigned to the application on a rotational basis.
- Support engineers are trained on the application architecture, key data flows, and common failure modes before taking on production responsibilities.
- Debugging follows a structured escalation path: L1 (monitoring and initial triage), L2 (technical investigation and workaround), L3 (root cause analysis and fix development).
- All debugging sessions are time-boxed to prevent prolonged production incidents.

#### 6.1.2 Source Code Documentation

Well-documented code is the foundation of effective support. The codebase maintains:

- **Module-level documentation:** Each module includes a header comment explaining its purpose, key dependencies, and important behavioural notes.
- **API documentation:** All REST endpoints are documented using OpenAPI/Swagger specifications, including request/response schemas, error codes, and authentication requirements.
- **Architecture documentation:** High-level architecture diagrams, data flow diagrams, and sequence diagrams for critical business workflows maintained in the `docs/` directory of the repository.
- **Runbook library:** Step-by-step operational runbooks for common support scenarios (restart procedures, cache clearing, configuration changes, common error conditions).
- **Database schema documentation:** Entity-relationship diagrams and data dictionary maintained and updated with each schema change.

#### 6.1.3 Knowledge Transfer

When AI tools are removed from the development process, a formal knowledge transfer programme is conducted:

- **Structured handover sessions:** AI-assisted developers conduct knowledge transfer sessions with traditional support developers, walking through critical modules, data flows, and known issue patterns.
- **Pair programming:** New support engineers pair with experienced developers for a defined period before taking independent responsibility.
- **Video walkthroughs:** Recorded technical walkthroughs of key system components stored in the team's knowledge base.
- **Architecture Q&A sessions:** Open sessions where support engineers can ask detailed technical questions of the engineering team.

#### 6.1.4 Code Ownership Model

- **Module ownership:** Each module of the application has an assigned primary owner (responsible for deep expertise and maintenance) and a secondary owner (backup coverage).
- **CODEOWNERS file:** A `CODEOWNERS` file in the repository automatically assigns the appropriate reviewers to pull requests affecting each module.
- **Ownership documentation:** The ownership model is documented and maintained, with updates required when team membership changes.

#### 6.1.5 Manual Debugging and Monitoring Tools

- **Log analysis:** Centralised logging platform (ELK Stack, Splunk, or CloudWatch Logs Insights) provides log search, filtering, and visualisation capabilities for manual investigation.
- **Application Performance Monitoring (APM):** Datadog, New Relic, or equivalent APM tool provides distributed tracing, request flow visualisation, and performance metrics without requiring code-level analysis.
- **Database query analysis:** Slow query logs, EXPLAIN plans, and database-level monitoring tools used to diagnose data layer performance issues.
- **Network analysis:** API gateway logs and network flow logs available for diagnosing connectivity and integration issues.

#### 6.1.6 Production Support Process

```
Incident Detected
       │
       ▼
  L1 Triage (0–15 min)
  - Confirm incident, assess severity
  - Initial impact assessment
  - Apply known workaround if available
       │
       ▼
  L2 Investigation (15–60 min)
  - Examine logs, metrics, and traces
  - Identify affected service/module
  - Escalate to L3 if root cause not found
       │
       ▼
  L3 Root Cause Analysis
  - Deep code and data analysis
  - Fix development and review
  - Hotfix deployment through expedited pipeline
       │
       ▼
  Post-Incident Review
  - Document root cause
  - Implement permanent fix
  - Update runbooks
```

---

## 7. Bug Handling Strategy After Production Deployment

### 7.1 Production Monitoring

A comprehensive monitoring strategy ensures issues are detected proactively, often before users are affected:

- **Synthetic monitoring:** Automated health check scripts execute representative user journeys on a schedule, verifying that critical paths (login, policy creation, claims submission) are functioning correctly.
- **Real User Monitoring (RUM):** Frontend performance and error rates monitored from the perspective of actual users in production.
- **Infrastructure monitoring:** CPU, memory, disk, and network metrics collected for all production infrastructure components. Automated alerts trigger when metrics cross defined thresholds.
- **Application metrics:** Custom business-level metrics tracked (e.g., number of policies processed per hour, claims API error rate, payment success rate) to detect anomalies in business throughput.
- **Error rate alerting:** Automatic alerts triggered when error rates on any API endpoint exceed a defined threshold (e.g., 1% 5xx error rate over 5 minutes).

### 7.2 Incident Response

#### 7.2.1 Incident Classification

| Severity | Definition | Response Time | Resolution Target |
|---|---|---|---|
| **P1 — Critical** | Production outage or data breach. All users affected. | 15 minutes | 4 hours |
| **P2 — High** | Major feature unavailable. Significant user impact. | 30 minutes | 8 hours |
| **P3 — Medium** | Degraded functionality. Workaround available. | 2 hours | 24 hours |
| **P4 — Low** | Minor issue. Minimal user impact. | Next business day | Next sprint |

#### 7.2.2 Incident Response Procedure

1. **Detection:** Alert triggered by monitoring system or reported by user.
2. **Acknowledgement:** On-call engineer acknowledges the alert within the defined response time.
3. **Communication:** Incident channel opened in communication platform (e.g., Slack). Stakeholders notified per the communication matrix.
4. **Triage:** Impact and scope assessed. Incident severity confirmed.
5. **Investigation:** Log analysis, distributed tracing, and metric review to identify the failing component.
6. **Mitigation:** Apply immediate mitigation to reduce user impact (e.g., feature flag to disable affected functionality, traffic rerouting, service restart).
7. **Resolution:** Root cause identified, fix developed, tested, and deployed.
8. **Post-Incident Review:** Within 48 hours for P1/P2 incidents, a post-incident review (blameless retrospective) is conducted and a written report produced.

### 7.3 Logging and Observability

The three pillars of observability provide comprehensive visibility into production system behaviour:

- **Logs:** Structured JSON logs from every application component, centralised and searchable. Log levels (DEBUG, INFO, WARN, ERROR, FATAL) consistently applied. Correlation IDs trace requests across multiple services.
- **Metrics:** Quantitative measurements of system behaviour (request rate, error rate, latency percentiles, database connection pool utilisation) visualised in dashboards and used for alerting.
- **Traces:** Distributed tracing (using OpenTelemetry) captures the complete execution path of each request across all services, making it possible to identify exactly which service and which operation is causing a problem.

### 7.4 Root Cause Analysis

- **Structured RCA process:** For all P1 and P2 incidents, a formal root cause analysis is conducted following the "5 Whys" or Ishikawa methodology.
- **Timeline reconstruction:** Logs and metrics are used to reconstruct the exact sequence of events leading to the incident.
- **Contributing factor identification:** Both technical and process contributing factors are identified to ensure the RCA addresses systemic issues, not just the immediate symptom.
- **Corrective actions:** Specific, measurable corrective actions are defined, assigned to owners, and tracked to completion.

### 7.5 Hotfix and Patch Deployment

- **Hotfix branch process:** Critical fixes are developed on a dedicated `hotfix/` branch created from the current production tag, not from the main development branch.
- **Expedited review:** Hotfixes receive expedited code review (minimum one senior engineer sign-off) while maintaining mandatory security review for any changes touching security-sensitive code.
- **Fast-track pipeline:** The CI/CD pipeline for hotfixes runs the same validation checks as normal deployments but prioritises queue position. The deployment to staging is validated against critical test scenarios before production deployment.
- **Change advisory board (CAB) fast-track:** P1 hotfixes follow a streamlined CAB approval process with verbal approval from the change manager, documented retrospectively.

### 7.6 Rollback Strategy

Every production deployment maintains a reliable rollback capability:

- **Immutable deployments:** Production deployments create new instances rather than modifying existing ones. The previous deployment version remains available for rapid reactivation.
- **Database migration versioning:** All database schema changes are versioned using a migration tool (Flyway, Liquibase, or Alembic). Migrations include a corresponding rollback script.
- **Feature flags:** New functionality is deployed behind feature flags, allowing it to be disabled instantly without a code deployment if issues are detected.
- **Rollback decision criteria:** Clear criteria define when a rollback is appropriate versus when mitigation and forward-fix is preferred. Rolling back a database migration is significantly more complex and risky than rolling back application code.
- **Rollback time targets:** Application rollback within 5 minutes for containerised deployments using Kubernetes rollback commands.

### 7.7 Data Protection During Debugging

- **No raw PII in logs:** Application logging is configured to redact or mask sensitive fields (names, policy numbers, payment information, tax identifiers) before writing to log storage.
- **Restricted log access:** Production log systems are access-controlled. Only authorised personnel with a legitimate need can access production logs. All access is itself logged.
- **Sanitised debug data:** When data samples are needed for debugging, production data is anonymised or synthetic equivalents are used wherever possible.
- **Encrypted log storage:** Log storage at rest is encrypted. Log transmission uses TLS.
- **Incident data handling policy:** A documented policy governs how data accessed during incident investigation must be handled, stored, and disposed of.

---

## 8. Governance Model for AI-Assisted Development

### 8.1 AI-Assisted Development Guidelines

To realise the benefits of AI-assisted development while controlling risks, the following guidelines govern how Claude Code and similar tools are used within the engineering team:

- **Authorised tools:** Only approved AI coding tools (Claude Code) are used for production code development. Unapproved tools require architecture team sign-off before use.
- **Contextual prompting:** Developers must provide Claude Code with relevant context including architecture constraints, coding standards, security requirements, and the specific business domain when requesting code generation.
- **Scope boundaries:** AI tools are used for implementation tasks. Architecture decisions, security design, and business logic interpretation remain exclusively human responsibilities.
- **No production data in prompts:** Under no circumstances is production data, customer PII, or credentials included in AI prompts. Test data and synthetic data are used for all development activities.
- **Output validation:** All AI-generated code is treated as a draft. It is subject to the same review, testing, and validation processes as human-authored code.

### 8.2 Mandatory Human Code Review

**Human review is non-negotiable for all code entering protected branches.** The review process includes:

- **Functional correctness:** Does the code correctly implement the specified requirement?
- **Security review:** Are all required security controls present and correctly implemented?
- **Architecture compliance:** Does the code follow the established architectural patterns and boundaries?
- **Test coverage:** Are adequate automated tests provided and do they meaningfully test the logic?
- **Documentation:** Is the code adequately commented where logic is non-obvious? Are API contracts documented?
- **Performance considerations:** Are there any obvious performance concerns (missing indexes, N+1 queries, unbounded result sets)?

Two-person review is required for changes to:
- Authentication and authorisation code
- Payment processing code
- Data encryption and decryption routines
- Infrastructure and CI/CD pipeline configuration

### 8.3 Security Audit

- **Pre-release security assessment:** Before each major release, a security assessment is conducted by a qualified security engineer or third-party penetration tester.
- **Quarterly security review:** Quarterly review of the security posture of the production application, including review of access controls, secret rotation status, and dependency vulnerabilities.
- **Continuous SAST:** Static analysis runs on every pull request. Security hotspots identified by SAST tools require explicit review and sign-off before merge.
- **Annual penetration test:** An independent penetration test is conducted annually by a qualified third-party security firm, with findings tracked to remediation.

### 8.4 Automated CI/CD Validation

Every code change must pass the following automated validations before it can be merged or deployed:

```
Pull Request Created
       │
       ├─ Linting and Formatting Check
       ├─ TypeScript / Type Safety Check
       ├─ Unit Test Suite (fail if < 80% coverage)
       ├─ Integration Test Suite
       ├─ Static Security Analysis (SAST)
       ├─ Dependency Vulnerability Scan
       ├─ Build Validation (Docker image build)
       │
       ▼
Human Code Review (mandatory)
       │
       ▼
Merge to Main Branch
       │
       ├─ Deploy to Staging Environment
       ├─ End-to-End Test Suite
       ├─ Dynamic Security Scan (DAST) on staging
       ├─ Performance Regression Test
       │
       ▼
Production Deployment (approval gate)
       │
       ├─ Smoke Tests
       ├─ Synthetic Monitoring Validation
       └─ Deployment tagged in release management
```

### 8.5 Version Control Governance

- **Branching strategy:** Trunk-based development with short-lived feature branches. Feature branches are merged via pull request within 2 days of creation to prevent long-running divergence.
- **Branch protection:** The `main` and `production` branches are protected. Direct pushes are prohibited. All changes require pull request with at least one approved review and all CI checks passing.
- **Commit signing:** All commits are GPG-signed to verify author identity. Unsigned commits are rejected by branch protection rules.
- **Semantic versioning:** Releases follow semantic versioning (MAJOR.MINOR.PATCH). Every production deployment is tagged with a version number.
- **Commit message standards:** Commits follow Conventional Commits specification (e.g., `feat:`, `fix:`, `security:`, `docs:`) to enable automated changelog generation and semantic release.
- **Pull request templates:** Standardised PR templates prompt developers to confirm testing, security considerations, and documentation before requesting review.

### 8.6 Documentation Standards

The following documentation is maintained as a first-class engineering deliverable, not an afterthought:

- **Architecture Decision Records (ADRs):** Every significant architectural decision is documented in a dated ADR, stored in `docs/architecture/decisions/`. ADRs are immutable — superseded decisions reference the replacing ADR.
- **API documentation:** All REST APIs documented using OpenAPI 3.0 specification. Documentation is generated from code annotations to ensure it remains current.
- **Operational runbooks:** Runbooks for all known operational scenarios stored in the wiki. Runbooks are reviewed and updated after every incident.
- **Onboarding guide:** A maintained developer onboarding guide covering environment setup, architecture overview, development workflow, and key contacts.
- **Data dictionary:** All data entities, fields, and their business meanings documented and maintained in alignment with the database schema.
- **Changelog:** A maintained CHANGELOG.md tracks all significant changes per release, auto-generated from Conventional Commits.

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **SAST** | Static Application Security Testing — analysis of source code for security vulnerabilities without executing the code |
| **DAST** | Dynamic Application Security Testing — testing of a running application for security vulnerabilities |
| **RBAC** | Role-Based Access Control — access control model where permissions are assigned to roles, and users are assigned to roles |
| **OWASP** | Open Web Application Security Project — non-profit that publishes security standards and vulnerability classifications |
| **JWT** | JSON Web Token — compact, URL-safe token format used for authentication and information exchange |
| **CI/CD** | Continuous Integration / Continuous Deployment — automated pipeline for building, testing, and deploying software |
| **IaC** | Infrastructure as Code — managing and provisioning infrastructure through machine-readable configuration files |
| **ADR** | Architecture Decision Record — document that captures an important architectural decision and its context |
| **MTTR** | Mean Time to Recovery — average time taken to restore service after an incident |
| **PII** | Personally Identifiable Information — data that can be used to identify an individual |
| **mTLS** | Mutual TLS — authentication protocol where both client and server authenticate each other using certificates |
| **SBOM** | Software Bill of Materials — formal record of all software components in an application |

---

## Appendix B: Recommended Tooling Reference

| Category | Recommended Tools |
|---|---|
| **AI Coding Assistant** | Claude Code (Anthropic) |
| **Static Analysis** | SonarQube, ESLint, Semgrep, TypeScript strict mode |
| **Security Scanning** | OWASP ZAP, Snyk, npm audit, Dependabot |
| **Testing** | Jest/Vitest (unit), Playwright/Cypress (E2E), k6 (load) |
| **Containerisation** | Docker, Kubernetes (EKS/AKS/GKE) |
| **Infrastructure as Code** | Terraform, AWS CloudFormation |
| **Monitoring & Observability** | Datadog, New Relic, OpenTelemetry, Prometheus/Grafana |
| **Log Management** | ELK Stack, Splunk, AWS CloudWatch |
| **Secret Management** | HashiCorp Vault, AWS Secrets Manager, Azure Key Vault |
| **API Documentation** | Swagger/OpenAPI 3.0 |
| **Version Control** | Git (GitHub/GitLab/Bitbucket) with branch protection |

---

*This document is maintained by the Enterprise Architecture team. For updates or clarifications, raise a request through the standard technical documentation process.*

*Document Version: 1.0 | Review Cycle: Annually or upon significant process change*
