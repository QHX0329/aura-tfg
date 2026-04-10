status: awaiting_human_verify
trigger: "Investigate and fix iOS GitHub Actions workflow failure for archive export (ios-archive-not-found-export)."
created: 2026-04-10T08:50:11.1132057+02:00
updated: 2026-04-10T09:19:00.0000000+02:00
---

## Current Focus

hypothesis: Local static verification now supports the fix, with only end-to-end CI execution remaining to fully confirm runtime behavior on GitHub macOS runners.
test: Verify that every archive/export reference in the workflow is consistent with ARCHIVE_PATH/EXPORT_PATH and confirm YAML validity with local parsing.
expecting: No mixed relative archive/export paths remain, no YAML syntax regressions exist, and only external CI runtime verification is pending.
next_action: Trigger/observe a GitHub Actions run to confirm archive generation and IPA export complete successfully.

## Symptoms

expected: Workflow should build and create .xcarchive, then export IPA successfully.
actual: Export step cannot find archive at expected path and exits 65.
errors: archive not found at /Users/runner/work/bargain-tfg/bargain-tfg/build/BargAIn.xcarchive
reproduction: Trigger iOS deploy workflow in GitHub Actions (staging iOS deployment).
started: Current recurring CI failure; prior success unknown.

## Eliminated

## Evidence

- timestamp: 2026-04-10T08:50:29.3882782+02:00
	checked: .planning/debug/knowledge-base.md
	found: Knowledge base file does not exist yet.
	implication: No prior known-pattern shortcut is available; proceed with normal investigation.

- timestamp: 2026-04-10T08:51:42.3999965+02:00
	checked: .github/workflows/*.yml for xcarchive/export usage
	found: Only ios-build.yml uses xcodebuild archive/export, with archive step in frontend/ios using ../../build/BargAIn.xcarchive and export step using build/BargAIn.xcarchive.
	implication: Archive/export path handling is centralized in ios-build.yml and currently depends on relative-path assumptions across steps.

- timestamp: 2026-04-10T08:53:32.6992605+02:00
	checked: ios-build.yml build-to-export flow
	found: There is no guard step validating archive existence before export.
	implication: The pipeline reaches export with a hardcoded expected path and fails with an opaque exit 65 when the archive is absent there.

- timestamp: 2026-04-10T08:54:11.3208652+02:00
	checked: .github/workflows/ios-build.yml
	found: Added job-level ARCHIVE_PATH and EXPORT_PATH env vars, replaced relative archive/export paths, and inserted a Verify archive exists step before export.
	implication: Archive and export now use one absolute location and fail early with explicit diagnostics when archive output is missing.

- timestamp: 2026-04-10T08:55:13.9742273+02:00
	checked: Lightweight validation commands
	found: Built-in YAML parsers were unavailable in this shell, but npx js-yaml parsed .github/workflows/ios-build.yml successfully and git diff confirmed only scoped workflow edits.
	implication: The workflow file remains syntactically valid with changes limited to archive/export path handling and diagnostics.

- timestamp: 2026-04-10T09:10:00.0000000+02:00
	checked: .github/workflows/ios-build.yml full content and git diff
	found: Build and export now both use the same ARCHIVE_PATH/EXPORT_PATH env vars, with archive directory creation before build and explicit archive existence verification before export.
	implication: Path handling no longer depends on per-step relative working directory assumptions.

- timestamp: 2026-04-10T09:12:00.0000000+02:00
	checked: Additional static checks (Select-String path scan, git diff --check, npx js-yaml)
	found: No leftover ../../build or mixed archivePath/exportPath usage remains; YAML parse passes; no diff whitespace errors beyond pre-existing LF->CRLF notice.
	implication: No local/static regression indicators were found in workflow path handling.

- timestamp: 2026-04-10T09:18:00.0000000+02:00
	checked: Deterministic assertions over ios-build.yml path arguments
	found: Legacy ../../build/BargAIn.xcarchive string is absent and all three -archivePath usages resolve to $ARCHIVE_PATH.
	implication: The original archive-path mismatch regression vector is statically eliminated in the current workflow file.

## Resolution

root_cause: Export used a hardcoded expected archive location without verification, while archive/export path handling relied on relative path assumptions across steps.
fix: Use a single absolute ARCHIVE_PATH/EXPORT_PATH at job scope and gate export behind an explicit archive existence check.
verification: Full workflow/diff review confirms unified archive/export paths, Select-String scan found no mixed relative path usage, deterministic assertions confirmed no legacy relative archive path and 3/3 archivePath references use $ARCHIVE_PATH, git diff --check found no relevant formatting regressions, and npx js-yaml parsing passed; a real GitHub Actions run is still required for end-to-end runtime confirmation.
files_changed: [.github/workflows/ios-build.yml]
