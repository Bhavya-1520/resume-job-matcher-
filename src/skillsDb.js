// Skills organized by professional category. The matcher uses these both to
// extract skills AND to detect which field the resume belongs to (the category
// with the most matches wins). Jobs are then filtered to that category.

const CATEGORIES = {
  Software: [
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "C",
    "Go", "Golang", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala",
    "R", "MATLAB", "Perl", "Dart", "Objective-C", "Bash", "Shell",
    "HTML", "CSS", "SASS", "SCSS", "Tailwind", "Bootstrap",
    "React", "React Native", "Angular", "Vue", "Vue.js", "Next.js",
    "Svelte", "jQuery", "Redux", "Webpack", "Vite",
    "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring",
    "Spring Boot", "Laravel", "Rails", "Ruby on Rails", ".NET",
    "ASP.NET", "GraphQL", "REST", "gRPC", "Microservices",
    "SQL", "MySQL", "PostgreSQL", "SQLite", "Oracle", "SQL Server",
    "MongoDB", "Redis", "Cassandra", "DynamoDB", "Elasticsearch",
    "Firebase", "Supabase", "MariaDB", "Neo4j",
    "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes",
    "Terraform", "Ansible", "Jenkins", "CI/CD", "GitHub Actions",
    "GitLab CI", "CircleCI", "Linux", "Nginx", "Apache", "Serverless",
    "Lambda", "CloudFormation", "Helm", "Prometheus", "Grafana",
    "Android", "iOS", "Flutter", "Xamarin",
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence",
    "Agile", "Scrum", "Kanban", "TDD", "Unit Testing", "Selenium",
    "Cypress", "Jest", "Pytest", "JUnit", "Postman", "Microservices",
  ],

  "Data & AI": [
    "Machine Learning", "Deep Learning", "Data Science", "Data Analysis",
    "NLP", "Computer Vision", "TensorFlow", "PyTorch", "Keras",
    "scikit-learn", "sklearn", "Pandas", "NumPy", "Matplotlib",
    "Seaborn", "Spark", "Hadoop", "Kafka", "Airflow", "Tableau",
    "Power BI", "Statistics", "LLM", "Hugging Face", "Data Engineering",
    "ETL", "Data Warehouse", "Snowflake", "Databricks", "BigQuery",
  ],

  "Finance & Accounting": [
    "Chartered Accountant", "CA", "CMA", "CPA", "ACCA", "CFA",
    "Accounting", "Accountant", "Audit", "Auditing", "Internal Audit",
    "Statutory Audit", "Taxation", "Tax", "GST", "Income Tax", "TDS",
    "Direct Tax", "Indirect Tax", "Transfer Pricing",
    "Bookkeeping", "Accounts Payable", "Accounts Receivable",
    "Financial Reporting", "Financial Analysis", "Financial Modeling",
    "Budgeting", "Forecasting", "Cost Accounting", "Management Accounting",
    "IFRS", "GAAP", "Ind AS", "Tally", "SAP FICO", "QuickBooks",
    "Reconciliation", "Payroll", "Compliance", "Treasury",
    "Equity Research", "Investment Banking", "Valuation", "MIS",
    "Working Capital", "Due Diligence", "Fund Management",
  ],

  "Sales & Marketing": [
    "Sales", "Business Development", "Lead Generation", "CRM",
    "Salesforce", "Digital Marketing", "SEO", "SEM", "Content Marketing",
    "Social Media Marketing", "Email Marketing", "Google Ads",
    "Facebook Ads", "Brand Management", "Market Research",
    "Account Management", "B2B Sales", "B2B", "B2C", "Negotiation",
    "Google Analytics", "HubSpot", "Marketing Strategy",
  ],

  "HR & Operations": [
    "Recruitment", "Talent Acquisition", "HR", "Human Resources",
    "Onboarding", "Payroll", "Employee Engagement", "HRMS",
    "Performance Management", "Operations", "Supply Chain",
    "Logistics", "Procurement", "Inventory Management", "Vendor Management",
    "Project Management", "PMP", "Six Sigma", "Lean",
  ],

  Design: [
    "Figma", "Adobe XD", "Photoshop", "Illustrator", "Sketch",
    "UI/UX", "UX Design", "UI Design", "Wireframing", "Prototyping",
    "InDesign", "After Effects", "Graphic Design", "User Research",
  ],
};

// Flat list of all skills (used by the matcher).
const SKILLS = Object.values(CATEGORIES).flat();

module.exports = { CATEGORIES, SKILLS };
