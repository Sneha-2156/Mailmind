# MASTER BUILD PROMPT — MAILMIND AI
## Transform My Existing AI Email Classifier into an Outstanding, Production-Quality AI Email Intelligence Platform

Act as a principal software architect, senior full-stack engineer, senior Python developer, machine learning engineer, AI engineer, UI/UX designer, database architect, security engineer and QA engineer with 15+ years of professional software development experience.

Your assignment is to transform my existing **AI_EMAIL_CLASSIFIER** project into a polished, intelligent, secure, full-stack AI-powered Email Intelligence and Productivity Platform.

Do not treat this as a basic college mini-project. Build it to demonstrate the engineering quality, product thinking, architecture and technical depth expected from a strong software engineering candidate.

You have access to my existing project ZIP/source code. You must inspect the actual project before changing anything.

---

# 1. PROJECT VISION

Product name: **MailMind AI**

Tagline: *Your inbox, intelligently understood.*

Product category: AI-powered Email Intelligence, Classification and Productivity Platform.

The application should connect to a user's Gmail account, intelligently understand incoming emails, classify and prioritize them, summarize important information, extract actionable tasks and deadlines, and help users manage their email more efficiently.

A particularly important differentiator is the Student & Career Intelligence module.

It should help students identify:
- Internship opportunities.
- Placement notifications.
- Job opportunities.
- Scholarship announcements.
- Academic notices.
- Examination schedules.
- Course and certification announcements.
- Application deadlines.
- Interview invitations.
- Important payment reminders.

The application must work as a general email intelligence platform while providing additional value to students and job seekers.

## Product objectives

1. Build a genuinely useful application, not just a UI demonstration.
2. Preserve and improve existing machine-learning functionality.
3. Implement secure, reliable Gmail integration.
4. Build a professional and responsive dashboard.
5. Introduce useful AI-powered features.
6. Create a maintainable and scalable codebase.
7. Add automated testing and documentation.
8. Make the project deployable.
9. Never use fake functionality or pretend an operation succeeded when it did not.

---

# 2. FIRST: AUDIT MY EXISTING PROJECT

Before coding, inspect the entire repository.

My existing project contains approximately:

- React 19 frontend.
- Python FastAPI backend.
- Scikit-learn LinearSVC classification model.
- TF-IDF vectorizer.
- Saved `.sav` model artifacts.
- Machine-learning training notebook.
- Email dataset.
- Gmail integration.
- Existing email category dashboard.
- Inbox and Spam functionality.

Inspect all source files, configuration files, dependency files, model artifacts, notebooks, stylesheets and API routes.

Look specifically for:

- Existing functionality worth preserving.
- Broken imports and routes.
- Incorrect API integration.
- Hardcoded localhost URLs.
- Missing dependencies.
- Insecure authentication.
- Shared global state.
- Database limitations.
- Model compatibility problems.
- Incorrect category labels.
- Unused components.
- Duplicate code.
- Responsive design issues.
- Security vulnerabilities.

Known issues that must be verified and fixed:

1. The backend has global in-memory email/category state. Replace this with proper user-specific database persistence.
2. The existing application uses Gmail App Password-based credentials. Replace this with Google OAuth 2.0.
3. The frontend contains a hardcoded localhost backend URL. Implement environment-based configuration.
4. The email detail view uses raw HTML rendering. Implement secure email HTML sanitization.
5. The spam operation does not reliably update Gmail itself. Implement actual Gmail label operations using the supported Gmail API.
6. The training data contains inconsistent category labels, including trailing whitespace in the Scholarship label. Normalize labels and reassess the classifier.
7. The model and vectorizer must be loaded with compatible, pinned dependencies.
8. Check and remove secrets or real personal email content from notebook outputs and datasets.
9. Restrict CORS and secure all user-specific API endpoints.

Important: Do not delete useful existing code without understanding it. Preserve the working ML classifier and UI components wherever sensible.

First establish a baseline. Inspect Git status, preserve user changes, and do not run destructive commands.

You may provide a brief architecture plan, but do not stop after creating the plan. Continue into implementation.

---

# 3. TECHNOLOGY STACK

Use the existing stack as the foundation.

### Frontend
- React 19.
- Vite.
- TypeScript where practical for new modules; do not break existing JavaScript functionality.
- Tailwind CSS.
- React Router.
- Axios or a consistent API client.
- Recharts for analytics.
- Lucide icons.
- React Hook Form and Zod for suitable forms.

### Backend
- Python.
- FastAPI.
- Pydantic.
- SQLAlchemy.
- Alembic.
- REST APIs.
- Proper modular service architecture.

### Database
- PostgreSQL.
- SQLAlchemy ORM.
- Proper relationships, indexes and constraints.

### Machine learning
- Python.
- Scikit-learn.
- Pandas.
- NumPy.
- TF-IDF.
- LinearSVC.
- Proper model evaluation and serialization.

### AI capabilities
Build an optional provider abstraction for AI-powered features such as:
- Email summarization.
- Action extraction.
- Smart reply generation.
- Email conversation analysis.

Support a configurable LLM provider such as Gemini or OpenAI.

Do not hardcode API keys. Do not make the application dependent on an unavailable paid API. Provide useful fallback behavior and clearly indicate when an optional AI provider is not configured.

### Integration
- Gmail API.
- Google OAuth 2.0.
- Optional Google Calendar integration for confirmed user-approved events.

### Testing and deployment
- Pytest.
- React Testing Library.
- Playwright for important end-to-end workflows.
- GitHub Actions.
- Docker.
- Docker Compose.

Use Redis and Celery only when the actual background-processing requirements justify them. Avoid unnecessary infrastructure.

---

# 4. COMPLETE APPLICATION MODULES

Implement the following product modules.

## MODULE A: Authentication and User Management

Create a secure authentication system.

Requirements:
- Google OAuth 2.0 sign-in.
- Gmail account connection.
- Secure session management.
- User profile.
- User-specific data.
- Logout.
- Gmail disconnection.
- Token revocation where supported.
- Account deletion.
- Secure credential storage.

Important security requirements:
- Never ask users to submit their Gmail passwords.
- Never store Gmail App Passwords.
- Store OAuth refresh tokens securely encrypted at rest.
- Keep credentials on the backend.
- Use secure cookies or an appropriately protected session strategy.
- Protect against CSRF, IDOR and unauthorized access.
- Validate OAuth state.
- Implement appropriate scopes and explain the permissions requested.
- Never log access tokens, refresh tokens or sensitive email content.

Use the least-privilege Gmail scopes needed for the actual implemented functionality.

Document any Google OAuth app verification or restricted-scope requirements for production distribution.

## MODULE B: Intelligent Email Classification

Preserve and improve my existing LinearSVC + TF-IDF model.

Implement a configurable, consistently normalized category taxonomy, including:

1. Academic.
2. Administration.
3. Campus Service.
4. Career and Opportunity.
5. Financial Services.
6. Service Notification.
7. Scholarship.
8. Skill Development.
9. Miscellaneous.

Use Spam/Suspicious as a separately assessed security classification where appropriate.

Requirements:

- Clean the original training dataset.
- Normalize category names.
- Remove duplicates.
- Handle empty emails.
- Handle missing values.
- Prevent training/test leakage.
- Use stratified train/validation/test splits.
- Evaluate the model on genuinely unseen data.
- Generate classification reports.
- Generate confusion matrices.
- Calculate precision, recall, F1-score and accuracy.
- Report macro and weighted metrics.
- Save reproducible model artifacts.
- Version the model and vectorizer together.
- Handle unknown and low-confidence predictions using Needs Review.
- Add a model evaluation script.
- Add a retraining script.

Do not invent model accuracy. Only report actual measured results.

Add classification explanations where practical, such as important TF-IDF terms or category-specific signals.

Remember that LinearSVC does not naturally produce calibrated probabilities. Do not present its raw decision scores as trustworthy probability percentages. Use calibrated confidence only after validation.

## MODULE C: Smart Priority Detection

Every email should have a priority:

- Critical.
- High.
- Medium.
- Low.

Consider:
- Sender.
- Subject.
- Message content.
- Deadlines.
- Meeting invitations.
- Application closing dates.
- Payment due dates.
- Urgent keywords.
- User feedback and preferences.

Explain why an email was marked important.

Allow users to override the priority.

## MODULE D: AI Email Summarization

Create an AI summarization interface.

For each email, generate:

1. Main summary.
2. Important information.
3. Required action.
4. Dates and deadlines.
5. Relevant links, where safely extractable.

Allow users to:
- Summarize an individual email.
- Summarize an entire conversation.
- Expand the original content.
- Copy the summary.

Do not invent information that is absent from the source email.

## MODULE E: Action Item and Deadline Extraction

This should be one of the most valuable features.

Extract structured information such as:

- Task title.
- Task description.
- Due date.
- Event date.
- Application deadline.
- Organization.
- Source email.
- Priority.
- Extraction confidence.
- Completion status.

Examples:

An internship email should produce:
- Company name.
- Role.
- Application link.
- Application closing date.

An examination notification should produce:
- Subject.
- Examination date.
- Time.
- Important instructions.

A scholarship email should produce:
- Scholarship name.
- Eligibility criteria.
- Required documents.
- Application deadline.

Never invent a deadline or assume an ambiguous date is confirmed. Mark uncertain information for user review.

Build a dedicated Tasks & Deadlines page.

Users should be able to:
- View extracted tasks.
- Edit tasks.
- Mark them complete.
- Delete tasks.
- Filter upcoming deadlines.
- Link tasks to original emails.

## MODULE F: Student and Career Intelligence

Build this as a major differentiating feature.

Create a dedicated dashboard for:

### Career Opportunities
- Internships.
- Full-time jobs.
- Campus placements.
- Hackathons.
- Technical competitions.
- Workshops.
- Certifications.

Extract:
- Company or organization.
- Opportunity title.
- Role.
- Eligibility.
- Skills required.
- Location or work mode.
- Stipend or salary, only when explicitly stated.
- Application URL.
- Application deadline.
- Source email.

Users should be able to:
- Save opportunities.
- Mark opportunities as applied.
- Track application status.
- Add personal notes.
- View upcoming deadlines.

Provide statuses:
- New.
- Saved.
- Applied.
- Assessment.
- Interview.
- Rejected.
- Offer.

Do not treat a promotional email as a verified opportunity automatically. Include source links and let users confirm extracted details.

## MODULE G: Smart Reply Generator

Provide professional response suggestions.

Reply styles:
- Professional.
- Friendly.
- Concise.
- Formal.
- Request more information.
- Accept invitation.
- Decline invitation.

Allow users to edit generated drafts.

Never automatically send an AI-generated message without explicit user approval.

For the first release, drafting and copying replies are sufficient. Add Gmail sending only after its OAuth permissions and safety behavior are correctly implemented.

## MODULE H: Phishing and Suspicious Email Detection

Build explainable security checks.

Analyze:
- Suspicious URLs.
- Sender-domain inconsistencies.
- Possible impersonation.
- Urgent payment requests.
- Suspicious attachments.
- Deceptive subject lines.
- Other phishing indicators.

Display:
- Risk level.
- Reasons for the warning.
- Suspicious elements.
- Recommended action.

Do not claim that an email is guaranteed safe.

Do not execute links, scripts or attachments.

Treat all email content as untrusted input.

## MODULE I: Advanced Search

Implement:
- Search by sender.
- Search by subject.
- Search by keywords.
- Search by category.
- Search by priority.
- Date filtering.
- Read/unread filtering.
- Saved email filtering.
- Opportunity filtering.

Optionally add semantic search using embeddings when the base system works reliably.

## MODULE J: Analytics Dashboard

Create a real analytics dashboard based on persisted data.

Display:

- Total emails processed.
- Unread emails.
- Important emails.
- Category distribution.
- Priority distribution.
- Suspicious emails.
- Weekly email activity.
- Opportunities discovered.
- Pending tasks.
- Upcoming deadlines.

Use charts and meaningful empty states.

All metrics must come from actual database records. Never use hardcoded dashboard statistics.

---

# 5. PROFESSIONAL UI/UX DESIGN

The user interface must look like a modern, premium SaaS application.

Take design inspiration from the visual quality and usability of Linear, Notion, Superhuman and modern productivity platforms.

Do not directly copy their branding or interfaces.

### Design direction

- Sophisticated.
- Minimal.
- Modern.
- Professional.
- Premium.
- Clean information hierarchy.
- Subtle animations.
- Excellent readability.
- Consistent spacing and typography.

Use a restrained color palette:
- Deep navy or neutral dark.
- White and soft gray surfaces.
- Restrained indigo or violet accents.
- Green for successful actions.
- Amber for warnings.
- Red for critical errors.

Support:
- Light mode.
- Dark mode.
- Mobile.
- Tablet.
- Desktop.
- Laptop.

### Application layout

Create a polished sidebar with:

1. Overview.
2. Inbox.
3. Important.
4. Categories.
5. Tasks & Deadlines.
6. Career Opportunities.
7. Analytics.
8. Settings.

### Inbox UI

Build:
- Search bar.
- Category tabs.
- Priority indicators.
- Sender information.
- Subject.
- Short previews.
- Timestamps.
- Read/unread indicators.
- Important labels.
- Bulk selection.
- Filter and sorting controls.

### Email detail page

Display:
- Sender.
- Recipients.
- Subject.
- Date.
- Original content.
- AI summary.
- Classification.
- Priority.
- Extracted tasks.
- Security warnings.
- Suggested replies.

Make email reading safe and comfortable.

### UX requirements

- Skeleton loading screens.
- Empty states.
- Error states.
- Success notifications.
- Confirmation dialogs.
- Accessible controls.
- Keyboard navigation.
- Responsive navigation.
- Clear validation messages.
- No nonfunctional buttons.
- No fake notifications.
- No broken routes.
- No overflowing layouts.

Avoid excessive gradients, random decorative elements, unnecessary glassmorphism and distracting animations.

The design should look like a credible commercial software product.

---

# 6. BACKEND ARCHITECTURE

Create a modular backend.

Suggested structure:

backend/
    app/
        main.py
        api/
            auth.py
            emails.py
            categories.py
            tasks.py
            opportunities.py
            analytics.py
            feedback.py
            settings.py
        core/
            config.py
            security.py
            oauth.py
            logging.py
        database/
            connection.py
            base.py
        models/
            user.py
            email.py
            task.py
            opportunity.py
            feedback.py
        schemas/
        services/
            gmail_service.py
            classifier_service.py
            summarizer_service.py
            extraction_service.py
            priority_service.py
            phishing_service.py
            reply_service.py
        workers/
        tests/

    ml/
        train.py
        evaluate.py
        predict.py
        artifacts/

    requirements.txt
    Dockerfile
    .env.example

Adjust this structure to the existing repository rather than blindly duplicating files.

Implement:
- Dependency injection.
- Centralized error handling.
- Structured logging.
- Request validation.
- Database transactions.
- Pagination.
- Search and filters.
- Authentication middleware/dependencies.
- User ownership validation.
- API versioning where sensible.
- Consistent HTTP status codes.

Every email-related endpoint must enforce ownership.

Never rely on the frontend alone for authorization.

---

# 7. DATABASE DESIGN

Design a normalized PostgreSQL database.

Include appropriate tables for:

- Users.
- OAuth credentials.
- Emails.
- Email categories.
- Classification predictions.
- Tasks.
- Opportunities.
- Classification feedback.
- User preferences.
- Synchronization history.

Use:
- Primary keys.
- Foreign keys.
- Unique constraints.
- Indexes.
- Created and updated timestamps.
- Appropriate cascade behavior.

Avoid storing unnecessary personal email information.

Implement database migrations with Alembic.

---

# 8. GMAIL INTEGRATION

Implement actual Gmail API integration.

Required operations:

- OAuth connection.
- Retrieve messages.
- Retrieve message metadata and content.
- Synchronize inbox.
- Handle pagination.
- Track Gmail message IDs.
- Avoid duplicate records.
- Update Gmail labels using supported API operations.
- Maintain synchronization state.
- Handle revoked or expired OAuth tokens.
- Handle API rate limits and transient errors.
- Disconnect Gmail.

Implement safe MIME parsing:
- Plain text.
- HTML.
- Multipart messages.
- Attachments as metadata where appropriate.

Do not execute attachments or remote scripts.

Do not assume every Gmail message has the same structure.

Never tell the user an operation succeeded until Gmail has confirmed it.

---

# 9. TESTING AND QUALITY ASSURANCE

Testing is mandatory.

### Backend tests
- Authentication.
- OAuth callback validation.
- User data isolation.
- Email retrieval.
- Category prediction.
- Category updates.
- Spam/label operations.
- Task extraction.
- Deadline handling.
- Analytics.
- Unauthorized requests.
- Invalid inputs.
- Error handling.

### ML tests
- Model loading.
- Vectorizer compatibility.
- Empty messages.
- Unknown categories.
- Label normalization.
- Prediction consistency.
- Evaluation reproducibility.

### Frontend tests
- Authentication screens.
- Dashboard loading.
- Inbox filters.
- Email details.
- Task management.
- Opportunity tracking.
- Theme switching.
- Error and empty states.

### Security tests
- IDOR.
- CSRF.
- XSS.
- Unsafe HTML.
- SQL injection prevention.
- Token leakage.
- CORS configuration.
- Sensitive log exposure.

### End-to-end tests

Test the full workflow:

1. User signs in.
2. User connects Gmail.
3. Emails synchronize.
4. Emails are categorized.
5. User opens an email.
6. AI summarizes the email.
7. A deadline is extracted.
8. User saves a career opportunity.
9. User corrects an incorrect prediction.
10. Dashboard analytics update.

Mock external Gmail and LLM services in automated tests. Use a dedicated test account for real integration testing.

Do not claim that tests passed unless you actually ran them.

---

# 10. DEPLOYMENT

Make the application deployment-ready.

Create:

- Frontend Dockerfile if appropriate.
- Backend Dockerfile.
- Docker Compose configuration.
- PostgreSQL configuration.
- Health-check endpoints.
- `.env.example`.
- Production environment configuration.
- Database migration instructions.
- Deployment documentation.

Support:
- Local development.
- Production deployment.
- HTTPS.
- Secure environment variables.
- Database persistence.
- Production CORS settings.
- Proper frontend/backend URLs.

Keep the deployment configuration platform-independent where practical.

Never commit actual `.env` files, secrets, OAuth credentials or real user emails.

Document which steps require my own Google Cloud credentials, database credentials, model-provider keys or hosting account.

Do not pretend to deploy to external services when you lack the credentials or access.

---

# 11. DOCUMENTATION AND GITHUB QUALITY

Create a professional README containing:

1. Project overview.
2. Problem statement.
3. Features.
4. Screenshots.
5. Architecture diagram.
6. Technology stack.
7. Application workflow.
8. ML architecture.
9. Model evaluation results.
10. Database schema.
11. API documentation.
12. Installation instructions.
13. Environment variables.
14. Running instructions.
15. Testing instructions.
16. Deployment guide.
17. Security and privacy notes.
18. Known limitations.
19. Future improvements.

Also create:

- CONTRIBUTING.md.
- LICENSE placeholder only if an appropriate license is selected.
- API documentation.
- Architecture documentation.
- `.gitignore`.
- `.env.example`.
- GitHub Actions CI workflow.

Never publish real user email data or personal credentials.

---

# 12. DEVELOPMENT EXECUTION RULES

This section is extremely important.

I do not want a theoretical answer or a list of suggestions.

I want you to WORK ON THE ACTUAL PROJECT FILES.

Follow this sequence:

### Stage 1: Inspection
- Explore the complete repository.
- Identify the frontend and backend entry points.
- Understand existing API contracts.
- Inspect ML artifacts and dataset.
- Establish what works and what is broken.

### Stage 2: Architecture and safety
- Preserve existing working functionality.
- Define the database schema.
- Plan modular backend services.
- Establish environment configuration.
- Implement authentication and user isolation.

### Stage 3: Core implementation
- Refactor the existing backend.
- Implement PostgreSQL.
- Implement Google OAuth.
- Implement Gmail synchronization.
- Fix email operations.
- Improve the ML pipeline.
- Implement the defined API endpoints.

### Stage 4: AI functionality
- Implement summarization.
- Implement priority detection.
- Implement task and deadline extraction.
- Implement career opportunity extraction.
- Implement smart replies.
- Implement explainable security checks.

### Stage 5: Frontend
- Upgrade the existing React application.
- Implement the full product dashboard.
- Connect every module to working APIs.
- Implement all loading, empty and error states.
- Implement responsive layouts.
- Add themes and accessible interactions.

### Stage 6: Testing
- Run backend tests.
- Run frontend tests.
- Run model evaluation.
- Run production builds.
- Fix actual failures.
- Re-test after fixes.

### Stage 7: Deployment and documentation
- Create Docker configuration.
- Create CI workflow.
- Document environment variables.
- Document deployment.
- Write the final README.

## Strict rules

1. Do not stop after auditing the repository.
2. Do not stop after creating a plan.
3. Do not merely explain what code I should write.
4. Directly create and modify project files.
5. Do not replace working features with placeholder components.
6. Do not create fake API responses for production functionality.
7. Do not hardcode credentials, URLs or user data.
8. Do not silently remove existing functionality.
9. Do not invent model evaluation metrics.
10. Do not use insecure authentication shortcuts.
11. Do not claim an API integration works without testing it.
12. Do not leave buttons that look functional but do nothing.
13. Do not ignore build errors or test failures.
14. Keep implementation modular and maintainable.
15. Use sensible defaults instead of repeatedly asking me questions.
16. When external credentials are unavailable, complete the implementation using configurable integrations and safe test mocks. Clearly document what requires my credentials.
17. Avoid adding dependencies without a clear reason.
18. Never expose private email content in logs.
19. Do not perform destructive operations on my existing project.
20. Prioritize correctness, security and functionality over flashy visuals.

If the scope is too large for one execution session, divide it into independent implementation milestones. Complete as much as possible in the current session, record exactly what remains, and continue from the saved project state in subsequent sessions.

---

# 13. FINAL ACCEPTANCE CRITERIA

The completed application must satisfy the following:

- [ ] Existing useful project functionality preserved.
- [ ] Secure Google authentication implemented.
- [ ] Gmail account connection works.
- [ ] Multiple users have isolated data.
- [ ] Emails persist in PostgreSQL.
- [ ] ML classification works.
- [ ] Model evaluation is reproducible.
- [ ] Priority detection works.
- [ ] AI summaries work when a provider is configured.
- [ ] Tasks and deadlines are extracted and editable.
- [ ] Career opportunities are extracted and trackable.
- [ ] Smart reply drafts work.
- [ ] Suspicious emails receive explainable warnings.
- [ ] Gmail operations perform actual supported operations.
- [ ] Dashboard analytics use real database data.
- [ ] Search and filtering work.
- [ ] Mobile and desktop layouts work.
- [ ] Light and dark themes work.
- [ ] Security tests are included.
- [ ] Backend tests are included.
- [ ] Frontend tests are included.
- [ ] Production builds succeed.
- [ ] Docker configuration works.
- [ ] Documentation is complete.
- [ ] No secrets are committed.

# 14. HOW TO REPORT COMPLETION

At the end, provide:

1. Summary of the final architecture.
2. Complete list of implemented features.
3. Important files created or modified.
4. Database schema summary.
5. API endpoint summary.
6. ML evaluation results with actual metrics.
7. Test results, including any failures.
8. Frontend build status.
9. Backend run instructions.
10. Frontend run instructions.
11. Docker instructions.
12. Required environment variables.
13. Google OAuth setup instructions.
14. Deployment instructions.
15. Features that remain incomplete.
16. Known security and operational limitations.

Separate completed features from partially implemented and unimplemented features.

Do not claim production readiness merely because the application builds.

---

# FINAL INSTRUCTION

Build **MailMind AI** as a serious, professional software engineering portfolio project.

I want the end result to demonstrate:

- Full-stack development.
- Strong backend architecture.
- REST API design.
- Database engineering.
- OAuth and API integration.
- Machine learning.
- NLP and generative AI.
- Security engineering.
- Automated testing.
- Deployment and DevOps.
- Professional UI/UX.

The final product should be something I can confidently demonstrate in a technical interview, explain its architecture, defend its engineering decisions and showcase on GitHub and my resume.

**Start by inspecting the actual repository now. Then implement the application, verify it and document it. Do not just tell me how to build it.**