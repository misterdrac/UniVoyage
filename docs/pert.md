# PERT Analysis – Project Workflow

##  Task Table

| Task | Description | Predecessor | Duration (days) |
|------|------------|------------|----------------|
| A | Requirements Analysis | - | 2 |
| B | Feature Definition | A | 2 |
| C | Backend Setup | B | 3 |
| D | Database & Migration | C | 4 |
| E | API Development | D | 4 |
| F | Frontend Setup | B | 3 |
| G | UI Development | F | 5 |
| H | Feature Implementation | G | 4 |
| I | System Integration | E, H | 3 |
| J | Testing & Bug Fixing | I | 4 |
| K | Deployment | J | 1 |


- The table above presents the PERT analysis of the project, including task dependencies and estimated durations.

---

## Workflow Overview

This PERT model represents a typical full-stack development lifecycle with parallel backend and frontend workflows.

### Parallel development:
- **Backend path:** C → D → E  
- **Frontend path:** F → G → H  

Both streams converge at:

- **I – System Integration**

After integration:
- Testing and bug fixing are performed
- Final deployment completes the project

---
