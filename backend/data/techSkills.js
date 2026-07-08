const TECH_SKILLS = {
    languages: [
        "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust",
        "swift", "kotlin", "php", "ruby", "scala", "perl", "lua", "r",
        "dart", "elixir", "clojure", "haskell", "purescript", "erlang", "groovy",
        "sql", "html", "css", "bash",
    ],
    frontend: [
        "react", "reactjs", "react.js", "angular", "vue", "vuejs", "svelte",
        "nextjs", "next.js", "nuxt", "gatsby", "remix",
        "redux", "mobx", "jquery", "bootstrap", "tailwind", "tailwindcss",
        "materialui", "mui", "chakra", "shadcn",
        "webpack", "vite", "babel", "esbuild",
        "html5", "css3", "styled-components",
    ],
    backend: [
        "nodejs", "node.js", "express", "expressjs", "express.js",
        "nestjs", "fastify", "koa",
        "django", "flask", "fastapi",
        "spring", "springboot", "spring boot",
        "rails", "ruby on rails", "laravel", "symfony",
        "asp.net", "dotnet", ".net",
        "graphql", "apollo", "restful",
        "grpc", "websocket", "socket.io",
    ],
    databases: [
        "mongodb", "postgresql", "postgres", "mysql", "sqlite",
        "redis", "elasticsearch", "cassandra", "dynamodb",
        "oracle", "mariadb", "couchdb", "firebase",
        "prisma", "typeorm", "sequelize", "mongoose", "presto",
        "kafka", "rabbitmq",
    ],
    cloud: [
        "aws", "amazon web services", "gcp", "google cloud", "azure",
        "docker", "kubernetes", "k8s", "terraform",
        "ec2", "s3", "lambda", "cloudfront", "rds",
        "ci/cd", "jenkins", "github actions", "gitlab ci",
        "nginx", "apache",
    ],
    devops: [
        "docker", "kubernetes", "jenkins", "gitlab", "github actions",
        "terraform", "ansible", "puppet", "chef",
        "prometheus", "grafana", "datadog", "new relic",
        "linux", "unix",
    ],
    tools: [
        "git", "github", "gitlab", "bitbucket",
        "jira", "confluence",
        "postman", "swagger", "openapi",
        "figma", "sketch", "adobe xd",
        "vscode", "intellij", "webstorm",
    ],
};

export { TECH_SKILLS };

export const findMissingTechSkills = (skillsList) => {
    const lowerSkills = skillsList.map((s) => s.toLowerCase());
    const missing = [];

    for (const [category, skills] of Object.entries(TECH_SKILLS)) {
        const categoryLowerSkills = lowerSkills.filter((s) => {
            return skills.some((tech) => s.includes(tech));
        });

        if (categoryLowerSkills.length === 0) {
            missing.push({ category, suggested: skills.slice(0, 5) });
        }
    }

    return missing;
};

export const findMatchedSkills = (skillsList) => {
    const lowerSkills = skillsList.map((s) => s.toLowerCase());
    const matched = {};
    const unmatched = [];

    for (const skill of skillsList) {
        const lower = skill.toLowerCase();
        let found = false;
        for (const [category, catSkills] of Object.entries(TECH_SKILLS)) {
            if (catSkills.some((ts) => lower.includes(ts))) {
                if (!matched[category]) matched[category] = [];
                matched[category].push(skill);
                found = true;
                break;
            }
        }
        if (!found) unmatched.push(skill);
    }

    return { matched, unmatched };
};
