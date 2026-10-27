import React from 'react';
import { Sparkles, ArrowRight, Zap, X } from 'lucide-react';

const SAMPLES = [
  {
    id: 'n-plus-1',
    title: 'N+1 Correlated Subquery',
    desc: 'Forces 20,000+ repetitive queries for active users. Replaced with LEFT JOIN.',
    target: 'laravel',
    dialect: 'PostgreSQL',
    query: `SELECT 
  u.id, 
  u.name, 
  (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS total_orders,
  (SELECT MAX(created_at) FROM orders o WHERE o.user_id = u.id) AS last_order_date
FROM users u
WHERE u.status = 'active';`
  },
  {
    id: 'non-sargable-date',
    title: 'Non-SARGable Date Function',
    desc: 'Wrapping column in YEAR() and MONTH() ruins index scans. Replaced with range compare.',
    target: 'prisma',
    dialect: 'MySQL',
    query: `SELECT user_id, amount, created_at
FROM transactions
WHERE YEAR(created_at) = 2025 AND MONTH(created_at) = 7;`
  },
  {
    id: 'wildcard-scan',
    title: 'Leading Wildcard & SELECT *',
    desc: 'LIKE \'%laptop%\' disables B-tree indexes, forcing full table scan across all columns.',
    target: 'typeorm',
    dialect: 'PostgreSQL',
    query: `SELECT * 
FROM products p
WHERE p.name LIKE '%laptop%' 
   OR p.description LIKE '%gaming%' 
ORDER BY p.created_at DESC;`
  },
  {
    id: 'comma-join-in',
    title: 'Implicit Comma Join & IN Subquery',
    desc: 'Outdated comma join and inefficient IN subquery with redundant DISTINCT.',
    target: 'django',
    dialect: 'MySQL',
    query: `SELECT DISTINCT c.id, c.first_name, c.last_name, c.email
FROM customers c, orders o
WHERE c.id = o.customer_id
  AND c.id IN (SELECT customer_id FROM payments WHERE amount > 500);`
  },
  {
    id: 'having-filter',
    title: 'Filtering in HAVING instead of WHERE',
    desc: 'HAVING groups all rows before filtering status, wasting memory and CPU.',
    target: 'drizzle',
    dialect: 'PostgreSQL',
    query: `SELECT department_id, COUNT(*) as employee_count, AVG(salary) as avg_salary
FROM employees
GROUP BY department_id
HAVING status = 'full_time' AND employee_count > 10;`
  },
  {
    id: 'type-cast-scan',
    title: 'Implicit Type Conversion',
    desc: 'Integer comparison on VARCHAR phone column disables indexes on millions of rows.',
    target: 'sql',
    dialect: 'MySQL',
    query: `SELECT order_id, customer_id, total_amount
FROM orders
WHERE customer_phone = 9876543210;`
  }
];

const SampleQueriesBar = ({ onSelectSample, onClose }) => {
  return (
    <div className="sample-bar-container glass-panel">
      <div className="sample-header">
        <h3>
          <Sparkles size={15} color="var(--accent-cyan)" />
          Quick Test: Real-World Unoptimized Queries
        </h3>
        <button 
          type="button" 
          onClick={onClose} 
          className="nav-btn"
          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
          title="Close sample queries bar"
        >
          <X size={13} /> Close
        </button>
      </div>

      <div className="sample-pills-grid">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className="sample-pill-card"
            onClick={() => onSelectSample(sample)}
          >
            <div className="sample-pill-title">
              <span>{sample.title}</span>
              <ArrowRight size={13} color="var(--accent-cyan)" />
            </div>
            <div className="sample-pill-desc">{sample.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SampleQueriesBar;
export { SAMPLES };
