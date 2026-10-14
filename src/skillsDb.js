// A curated list of common skills for offline resume skill detection.
// Broad but not exhaustive. The matcher looks for these terms
// (case-insensitive, word-boundary aware) inside the resume text.

const SKILLS = [
  // Programming languages
  "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "C",
  "Go", "Golang", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala",
  "R", "MATLAB", "Perl", "Dart", "Objective-C", "Bash", "Shell",

  // Web / frontend
  "HTML", "CSS", "SASS", "SCSS", "Tailwind", "Bootstrap",
  "React", "React Native", "Angular", "Vue", "Vue.js", "Next.js",
  "Svelte", "jQuery", "Redux", "Webpack", "Vite",

  // Backend / frameworks
  "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring",
  "Spring Boot", "Laravel", "Rails", "Ruby on Rails", ".NET",
  "ASP.NET", "GraphQL", "REST", "gRPC", "Microservices",

  // Databases
  "SQL", "MySQL", "PostgreSQL", "SQLite", "Oracle", "SQL Server",
  "MongoDB", "Redis", "Cassandra", "DynamoDB", "Elasticsearch",
  "Firebase", "Supabase", "MariaDB", "Neo4j",

  // Cloud / DevOps
  "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes",
  "Terraform", "Ansible", "Jenkins", "CI/CD", "GitHub Actions",
  "GitLab CI", "CircleCI", "Linux", "Nginx", "Apache", "Serverless",
  "Lambda", "CloudFormation", "Helm", "Prometheus", "Grafana",

  // Data / ML / AI
  "Machine Learning", "Deep Learning", "Data Science", "Data Analysis",
  "NLP", "Computer Vision", "TensorFlow", "PyTorch", "Keras",
  "scikit-learn", "sklearn", "Pandas", "NumPy", "Matplotlib",
  "Seaborn", "Spark", "Hadoop", "Kafka", "Airflow", "Tableau",
  "Power BI", "Excel", "Statistics", "LLM", "Hugging Face",

  // Mobile
  "Android", "iOS", "Flutter", "Xamarin",

  // Tools / practices
  "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence",
  "Agile", "Scrum", "Kanban", "TDD", "Unit Testing", "Selenium",
  "Cypress", "Jest", "Pytest", "JUnit", "Postman",

  // General / domain
  "Project Management", "Communication", "Leadership", "Teamwork",
  "Problem Solving", "Figma", "Adobe XD", "Photoshop", "UI/UX",
  "SEO", "Digital Marketing", "Salesforce", "SAP",
];

module.exports = { SKILLS };
