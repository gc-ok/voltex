# VOLTEX - Interactive Volleyball Playbook

VOLTEX is an interactive, web-based platform for volleyball coaches and players. It serves as a rotation simulator, an animated playbook, and a training tool designed to move beyond static whiteboards into a dynamic, collaborative environment.

This project is the Next.js/React implementation of the vision outlined in the initial `Volleyball_mvp.html` prototype.

## About The Project

Volleyball rotations and plays are spatially complex and difficult to teach with traditional methods. VOLTEX aims to solve this by providing a centralized platform where:
- **Coaches** can build and animate complex plays and save them to a library.
- **Players** can log in to study their assignments, watch plays unfold, and test their knowledge.

The ultimate vision is a multi-tenant SaaS product for clubs and athletic departments, standardizing training and increasing player accountability.

### Built With

*   [Next.js](https://nextjs.org/)
*   [React](https://react.dev/)
*   [TypeScript](https://www.typescriptlang.org/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later)
*   npm

### Installation

1.  Clone the repo
    ```sh
    git clone <your-repo-url>
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```

### Running the Application

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`.

## Core Features (from MVP)

*   **Interactive Court & Rotation Engine**: A drag-and-drop 2D court that can validate player alignments against official overlap rules.
*   **Animated Playbook Library**: A keyframe-based animation system to show plays phase-by-phase, complete with a timeline scrubber, speed controls, and ghost trails to trace player paths.
*   **Play Builder**: An interface for creating and modifying plays by dragging players to different positions for each phase of the play.
*   **Quiz Mode**: An interactive quiz that loops an animated play and asks the user questions to identify rotations, plays, and defensive systems.
