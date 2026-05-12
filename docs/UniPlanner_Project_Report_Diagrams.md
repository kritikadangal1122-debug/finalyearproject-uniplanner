# UniPlanner Project Report Diagrams

This file provides clean, organized diagrams for the figure placeholders referenced in `UniPlanner_Project_Report.docx`.

## Figure 1.1: Agile Scrum Methodology

```mermaid
flowchart LR
    A[Requirement Analysis] --> B[Product Backlog]
    B --> C[Sprint Planning]
    C --> D[Implementation]
    D --> E[Testing & Validation]
    E --> F[Sprint Review]
    F --> G[Sprint Retrospective]
    G --> C
    F --> H[Increment Delivered]
```

## Figure 3.1: Gantt Chart of UniPlanner Development Schedule

```mermaid
gantt
    title UniPlanner Development Schedule
    dateFormat  YYYY-MM-DD
    section Planning
    Requirement Analysis           :a1, 2025-01-01, 14d
    Feasibility Study              :a2, after a1, 7d
    section Design
    System Modeling (UML)          :b1, after a2, 10d
    System Design                  :b2, after b1, 12d
    section Implementation
    Frontend + Backend Development :c1, after b2, 28d
    section Testing
    Integration & QA Testing       :d1, after c1, 14d
    section Deployment
    Final Deployment & Report      :e1, after d1, 7d
```

## Figure 3.2: Use Case Diagram of UniPlanner

```mermaid
usecaseDiagram
    actor Student
    actor Teacher
    actor Administrator as Admin

    Student --> (Login)
    Teacher --> (Login)
    Admin --> (Login)

    Student --> (View Dashboard)
    Teacher --> (View Dashboard)
    Admin --> (View Dashboard)

    Student --> (Enroll in Class)
    Student --> (Submit Assignment)
    Student --> (View Resources)

    Teacher --> (Create Assignment)
    Teacher --> (Grade Submission)
    Teacher --> (Upload Resource)

    Admin --> (Manage Users)
    Admin --> (View Analytics)
```

## Figure 3.3: Class Diagram of UniPlanner

```mermaid
classDiagram
    class User {
      +id
      +name
      +email
      +role
    }
    class Student
    class Teacher
    class Administrator
    class Class
    class Assignment
    class Submission
    class Resource
    class Discussion
    class Message
    class Notification
    class Event
    class AnalyticsEvent

    User <|-- Student
    User <|-- Teacher
    User <|-- Administrator

    Teacher "1" --> "many" Assignment : creates
    Class "1" --> "many" Student : has
    Student "1" --> "many" Submission : makes
    Assignment "1" --> "many" Submission : receives
    Class "1" --> "many" Resource : contains
    Class "1" --> "many" Discussion : hosts
    User "1" --> "many" Message : sends/receives
    User "1" --> "many" Notification : receives
    Class "1" --> "many" Event : schedules
    User "1" --> "many" AnalyticsEvent : generates
```

## Figure 3.4: Sequence Diagram of Login and Dashboard Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (Login Form)
    participant B as Backend API (/api/auth/login)

    U->>F: Enter email + password
    F->>B: POST /api/auth/login
    B->>B: Validate email and password hash
    alt Valid credentials
        B-->>F: JWT token + user object
        F->>F: Store token
        F-->>U: Render role-specific dashboard
    else Invalid credentials
        B-->>F: Authentication error
        F-->>U: Show login failure message
    end
```

## Figure 3.5: Activity Diagram of Assignment Submission Workflow

```mermaid
flowchart TD
    A[Student views pending assignments] --> B[Select assignment]
    B --> C{Use automated feedback first?}
    C -- Yes --> D[Review draft with feedback tool]
    C -- No --> E[Prepare final submission]
    D --> E
    E --> F[Upload file or enter text]
    F --> G[System validates submission]
    G --> H[System saves submission]
    H --> I[Teacher receives notification]
    I --> J[Teacher grades with SpeedGrader]
    J --> K[Student receives grade notification]
```

## Figure 4.1: Refined Class Diagram of UniPlanner

```mermaid
classDiagram
    class User {
      +id
      +name
      +email
      +role
      +title
      +avatar
      +bio
      +locale
      +xp
      +badges
      +passwordHash
    }
    class Class {
      +id
      +code
      +title
      +subject
      +section
      +teacherId
      +teacherName
      +color
      +description
      +progress
      +archived
      +enrolledStudentIds[]
    }
    class Assignment {
      +id
      +classId
      +title
      +kind
      +dueDate
      +status
      +maxPoints
      +submissions[]
      +averageScore
      +manualReview
      +description
      +rubric
    }
    class Submission {
      +id
      +assignmentId
      +studentId
      +contentText
      +fileName
      +fileUrl
      +submittedAt
      +score
      +teacherFeedback
      +plagiarismScore
      +qualityScore
      +lateFlag
    }
    class Resource {
      +id
      +classId
      +title
      +type
      +url
      +uploadedBy
      +createdAt
    }
    class Discussion {
      +id
      +classId
      +title
      +authorId
      +posts[]
    }
    class Message {
      +id
      +fromId
      +toId
      +content
      +sentAt
      +read
    }
    class Notification {
      +id
      +userId
      +title
      +description
      +type
      +unread
      +createdAt
    }
    class Event {
      +id
      +title
      +type
      +date
      +startTime
      +endTime
      +classId
    }
    class AnalyticsEvent {
      +id
      +userId
      +classId
      +type
      +name
      +payload
      +createdAt
    }

    User "1" --> "many" Class : teaches/enrolls
    Class "1" --> "many" Assignment
    Assignment "1" --> "many" Submission
    Class "1" --> "many" Resource
    Class "1" --> "many" Discussion
    User "1" --> "many" Message
    User "1" --> "many" Notification
    Class "1" --> "many" Event
    User "1" --> "many" AnalyticsEvent
```

## Figure 4.2: Component Diagram of UniPlanner

```mermaid
flowchart LR
    subgraph Client[Frontend Component - Browser Client]
      UI[Role-specific UI Pages]
      Store[Reactive Local Store]
      Fetch[Fetch API]
      UI --> Store
      Store --> Fetch
    end

    subgraph Server[Backend API Server - Node.js/Express.js]
      API[REST API Endpoints]
      Auth[Auth Module]
      Classes[Classes Module]
      Assignments[Assignments Module]
      Submissions[Submissions Module]
      Resources[Resources Module]
      Discussions[Discussions Module]
      Messages[Messages Module]
      Notifications[Notifications Module]
      Events[Events Module]
      Analytics[Analytics Module]
      Upload[Upload Module]
      AI[Automated Feedback Module]
      Security[JWT Security Component]
    end

    subgraph Data[Persistence]
      StoreDB[(LearningStore JSON Data Store)]
      Cloud[(Cloudinary CDN)]
    end

    Fetch --> API
    API --> Auth
    API --> Classes
    API --> Assignments
    API --> Submissions
    API --> Resources
    API --> Discussions
    API --> Messages
    API --> Notifications
    API --> Events
    API --> Analytics
    API --> Upload

    Auth --> Security
    Classes --> StoreDB
    Assignments --> StoreDB
    Submissions --> StoreDB
    Resources --> StoreDB
    Discussions --> StoreDB
    Messages --> StoreDB
    Notifications --> StoreDB
    Events --> StoreDB
    Analytics --> StoreDB

    Upload --> Cloud
    AI --> API
```

## Figure 4.3: Deployment Diagram of UniPlanner

```mermaid
flowchart TB
    subgraph Clients[Client Devices]
      Desktop[Desktop Browser]
      Tablet[Tablet Browser]
      Mobile[Mobile Browser]
    end

    subgraph AppNode[Application Server Node]
      Static[Static Frontend Assets /public]
      Backend[Node.js + Express API /api/v1]
      LocalStore[(Local JSON Store)]
      Backend <--> LocalStore
      Static --> Backend
    end

    subgraph External[External Services]
      Cloudinary[(Cloudinary CDN)]
      Firebase[(Firebase - Optional Realtime Sync)]
    end

    Desktop --> Static
    Tablet --> Static
    Mobile --> Static

    Desktop --> Backend
    Tablet --> Backend
    Mobile --> Backend

    Backend --> Cloudinary
    Backend -. compatible .-> Firebase

    Dev[Development Environment\nLive Server:5500 + Backend:3000\nCORS enabled] -. local setup .-> AppNode
```
