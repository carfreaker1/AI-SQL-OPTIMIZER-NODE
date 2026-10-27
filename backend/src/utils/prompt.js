export const buildPrompt = (query, target = "sql") => `
You are a senior database performance engineer and backend developer.

Do TWO things:

1. Optimize the SQL query:
   - optimized_query
   - indexes (array)
   - issues (array)
   - explain_summary (string)

2. Convert the SQL query into ${target} format:
   - converted_query
   - explanation

Return JSON in this format:
{
  "optimized_query": "...",
  "indexes": [],
  "issues": [],
  "explain_summary": "...",
  "converted_query": "...",
  "explanation": "..."
}

Rules:
- Return ONLY valid JSON
- Do NOT use markdown or backticks

SQL Query:
${query}
`;