# Knowledge-to-Skill Protocol

## Goal

Convert large reference material into compact, discoverable, evidence-aware agent knowledge without dumping entire books/documents into every context window.

Structural inspiration: `virgiliojr94/book-to-skill`.

## When to use

Use when a project depends on a substantial book, manual, policy set, research corpus, interview archive, or technical documentation.

## Output structure

For rights-cleared/internal sources:

```text
<skill>/
  SKILL.md
  cheatsheet.md
  patterns.md
  glossary.md
  references/
    source-index.md
    topic-*.md
```

`SKILL.md` contains the highest-value decision rules and routing index. Detailed references load only when the current task needs them.

## Extraction loop

1. Verify the source and usage rights.
2. Extract structure and text locally where practical.
3. Identify chapters/topics and the decisions each topic helps make.
4. Synthesize practitioner rules: `Use X when Y because Z`.
5. Build a topic index so agents can retrieve only what they need.
6. Add decision tables, thresholds, failure modes, and examples where useful.
7. Separate source-derived content from agent inference.
8. Validate that the skill does not invent unsupported claims.
9. Test retrieval against real project questions.
10. Update the skill when source material or execution experience changes.

## Copyright boundary

For third-party copyrighted books:

- do not store raw passages beyond minimal quotation needed for commentary;
- do not create a public chapter-by-chapter substitute;
- keep detailed generated study notes private/local unless rights allow redistribution;
- public shared skills should contain original high-level procedures and decision rules.

## Project specificity

Shared knowledge does not override tenant context.

An agent must first load tenant/project truth, then use reference skills as lenses. The same brand, marketing, project-management, or usability principle may produce different actions for different projects.

## Evidence labels

Knowledge notes should distinguish:

- `SOURCE` — directly supported by reference;
- `PROJECT_FACT` — supported by tenant/client evidence;
- `INFERENCE` — reasoned conclusion;
- `HYPOTHESIS` — testable idea;
- `DECISION` — explicitly chosen path.

## Quality test

A useful skill should reduce discovery/context cost while improving decisions. If agents must read the entire source every time, the skill has failed.