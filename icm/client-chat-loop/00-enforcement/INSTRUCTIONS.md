# Client Chat Loop 00 — Instructions

Create a machine-readable execution loop that can carry slices 01-07 without scope drift.

The loop must stop internally after every slice, run a checkpoint and fresh critic, check conflicts and safety boundaries, then automatically continue only after the slice passes and exactly one PR is merged.

Do not redesign or mutate the ASC3ND public website. Do not make PopeBot, Netlify, or a chat database the canonical organizational truth. ICM remains canonical and recoverable.
