#!/bin/bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

block() {
  echo "BLOCKED: '$COMMAND' $1. The user has prevented you from doing this." >&2
  exit 2
}

DANGEROUS_PATTERNS=(
  "git reset --hard"
  "git clean -fd"
  "git clean -f"
  "git branch -D"
  "git checkout \."
  "git restore \."
  "push --force"
  "reset --hard"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    block "matches dangerous pattern '$pattern'"
  fi
done

# git push is allowed only in one exact shape, to a named non-default branch:
#   git push [-u|--set-upstream] origin <branch>
# Anything else (force, delete, mirror, tags, refspecs, implicit targets,
# main/master) is blocked.
PROTECTED_BRANCHES="main|master"
SAFE_PUSH="^git push( (-u|--set-upstream))? origin ([A-Za-z0-9._/-]+)$"

if echo "$COMMAND" | grep -qE "git[[:space:]]+(-[^[:space:]]+[[:space:]]+)*push"; then
  while IFS= read -r segment; do
    segment=$(echo "$segment" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g; s/[[:space:]]+/ /g')
    echo "$segment" | grep -qE "git( -[^ ]+)* push" || continue
    [[ "$segment" =~ $SAFE_PUSH ]] || block "is not of the form 'git push [-u] origin <branch>'"
    branch="${BASH_REMATCH[3]}"
    if echo "$branch" | grep -qE "^($PROTECTED_BRANCHES|HEAD)$"; then
      block "pushes to protected branch '$branch'"
    fi
  done < <(echo "$COMMAND" | sed -E 's/(&&|\|\||;|\|)/\n/g')
fi

exit 0
