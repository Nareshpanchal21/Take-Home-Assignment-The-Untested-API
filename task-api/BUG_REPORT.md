# Bug Report

## Bug 1: Incorrect Status Filtering

### Expected Behavior
Status filtering should match the exact status.

### Actual Behavior
`getByStatus()` uses partial matching, so `"do"` also matches `"todo"`.

### How Discovered
A unit test checked that searching for `"do"` should return an empty array, but the task with status `"todo"` was returned.

### Suggested Fix
Use an exact status comparison instead of `.includes()`.

---

## Bug 2: Completing a Task Changes Priority

### Expected Behavior
Completing a task should change its status to `done` and set `completedAt`, while keeping its existing priority.

### Actual Behavior
`completeTask()` changes the priority to `medium`, even when the original priority is `high`.

### How Discovered
A unit test created a high-priority task and completed it. The test expected `high` but received `medium`.

### Suggested Fix
Preserve the existing priority when completing a task.

---

## Bug 3: Pagination Offset Calculation

### Expected Behavior
Page 1 with limit 2 should return Task 1 and Task 2. Page 2 should return Task 3.

### Actual Behavior
The original pagination logic started page 1 from Task 3.

### How Discovered
Unit and integration tests for pagination failed.

### Fix Applied
Changed the offset calculation from:

`page * limit`

to:

`(page - 1) * limit`

### Result
All pagination tests now pass.