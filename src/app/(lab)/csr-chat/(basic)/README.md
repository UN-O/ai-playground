# README.md

## Project Overview

This project demonstrates and compares two approaches for rendering and managing chat messages on the client side. The structure of the project is divided into folders, each representing a specific implementation method.

---

## Folder Structure

### 1. **`rsc/`**
This folder showcases the use of **Server Actions** to handle chat functionality. This server-driven approach establishes communication between the client and server, allowing for efficient data handling.

#### Files:
- **`actions.ts`**: Contains the Server Actions for managing chat functionality.
- **`chat-section.tsx`**: A React component implementing chat functionality with Server Actions.
- **`page.js`**: The entry point for rendering the server-side chat example.

---

### 2. **`ui/`**
This folder demonstrates the use of the `useChat` hook from the **`ai-sdk-ui`** library. This client-side approach simplifies state management for chat and encapsulates message handling.

#### Files:
- **`chat-section.tsx`**: A React component utilizing the `useChat` hook for chat interactions.
- **`page.js`**: The entry point for rendering the chat example with `useChat`.

---

### 3. **`api/`**
This folder focuses on an API-driven approach to manage chat functionality. This is designed to interact with backend routes for handling chat data.

#### Files:
- **`route.js`**: Defines API routes for managing chat requests.
- **`chat-section.tsx`**: A React component for API-driven chat interactions.
- **`page.js`**: The entry point for testing the API-driven chat handling.

---

## Objectives

1. Compare two client-side rendering approaches for chat messages:
   - **`ui/`**: Using the `useChat` hook (from `ai-sdk-ui`).
   - **`rsc/`**: Using Server Actions to handle chat data.
2. Identify trade-offs in performance and usability between the two approaches.
3. Test and refine API-based solutions provided in the `api/` folder.

---

## Usage

1. Navigate to either `ui/` or `rsc/` to test respective implementations.
2. Use the provided components (`chat-section.tsx`) to interact with the chat features.
3. The `api/` folder contains the API implementation for handling chat requests.

---

## TODO

- **Upgrade SDK to Version 4.0:** Update the `ai-sdk-ui` library and other dependencies to their latest versions.
- **Re-evaluate differences:** Compare and document the differences between the `useChat` and Server Actions approaches after upgrading.
- **Enhance examples:** Expand on the examples to demonstrate real-world use cases.

---

## Notes

This project is designed for educational and experimental purposes. It provides insights into the flexibility and performance of various rendering and data-handling techniques for chat functionality in modern web applications.
