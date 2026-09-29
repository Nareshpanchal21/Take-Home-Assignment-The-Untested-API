# Submission Notes

## What I would test next with more time

- More validation cases for pagination parameters such as negative page and limit values.
- Additional edge cases for task updates.
- More tests for invalid or unusual date values.
- Tests for concurrent requests and data consistency.

## Anything surprising in the codebase

The API uses an in-memory array instead of a database, so all task data is lost whenever the server restarts.

I also found a few existing behavior issues while writing tests, including partial status matching and priority changing when a task is completed.

## Questions before production

- Which database should be used for persistent task storage?
- Should authentication and authorization be added?
- What should be the final API validation rules?
- Should pagination return metadata such as total tasks and total pages?
- What logging and error monitoring should be used in production?

## Assignment Feature Decision

For the task assignment feature:

- Empty or non-string assignee values return `400 Bad Request`.
- A non-existent task returns `404 Not Found`.
- If a task is already assigned, the API returns `409 Conflict`.