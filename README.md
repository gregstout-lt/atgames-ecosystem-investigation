# AtGames Ecosystem Investigation

## Project Overview

This project is focused on investigating and understanding the relationships between four different AtGames repositories and how they connect to each other. This is not a development project for any single repository, but rather a comprehensive analysis of the entire ecosystem.

## Repository Structure

```
atgames-ecosystem-investigation/
├── documentation/          # Investigation findings, analysis reports, diagrams
├── cursor-rules/          # Shared cursor AI rules for consistent analysis
├── history/              # Session logs, progress tracking, decision history  
├── analysis/             # Comparative analysis, architecture diagrams, findings
└── repositories/         # Symbolic links to the four repositories under investigation
    ├── retro_backend_java -> ../../retro_backend_java
    ├── arcadenet -> ../../arcadenet  
    ├── CE-AtGames -> ../../CE-AtGames
    └── dongle_menu_qt -> ../../dongle_menu_qt
```

## Investigation Subjects

### 1. retro_backend_java
- **Type**: Java Spring Boot backend service
- **Purpose**: Modern backend API for retro gaming services
- **Key Technologies**: Java, Spring Boot, JPA/Hibernate, REST APIs

### 2. arcadenet  
- **Type**: Ruby on Rails web application
- **Purpose**: Legacy web platform for arcade gaming network
- **Key Technologies**: Ruby on Rails, PostgreSQL, API services

### 3. CE-AtGames
- **Type**: C++ native application/game engine
- **Purpose**: Core engine and OS documentation for AtGames devices
- **Key Technologies**: C++, CMake, cross-platform development

### 4. dongle_menu_qt
- **Type**: Qt-based desktop application  
- **Purpose**: Menu system and interface for AtGames hardware
- **Key Technologies**: Qt, C++, GUI development

## Investigation Goals

1. **Architecture Analysis**: Understand how these systems interact and communicate
2. **Data Flow Mapping**: Trace data and API calls between systems
3. **Technology Stack Comparison**: Compare approaches, patterns, and technologies
4. **Integration Points**: Identify where systems connect and depend on each other
5. **Evolution Understanding**: Understand the historical development and relationships

## Getting Started

This investigation project uses Cursor AI with shared rules for consistent analysis. The cursor rules are centralized in the `cursor-rules/` directory and apply to all investigation work.

### Workspace Setup

Open this directory (`atgames-ecosystem-investigation`) as your main Cursor workspace. The individual repositories are accessible via symbolic links in the `repositories/` folder.

### Documentation Standards

- All findings go in `documentation/`
- Analysis and comparisons go in `analysis/`  
- Session history and progress tracking in `history/`
- Use consistent naming: `YYYY-MM-DD-topic-name.md`

## Investigation Status

🔄 **In Progress** - Initial project structure setup completed
📋 **Next Steps** - Begin systematic analysis of each repository

---

*This is an investigation project, not a development project. The focus is on understanding, documenting, and analyzing the relationships between the four AtGames repositories.*
