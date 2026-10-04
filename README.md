````markdown
# IMS Frontend

Frontend application for the **Inventory Management System (IMS)** built with **React**, **Vite**, and **Bun**.

## Prerequisites

- [Bun](https://bun.sh/) installed on your machine

## Installation

Install the project dependencies:

```bash
bun install
````

## Running the Development Server

Start the development server:

```bash
bun dev
```

The application will be available at:

```
http://localhost:5173
```

## Building for Production

Create a production build:

```bash
bun run build
```

## Running with Docker

Build the image (serves the production build via nginx):

```bash
docker build -t ims-frontend .
```

Run it standalone, pointing at a backend reachable from inside the container:

```bash
docker run -p 8080:80 -e BACKEND_URL=http://host.docker.internal:3000 ims-frontend
```

The app will be available at `http://localhost:8080`. `BACKEND_URL` is where nginx proxies `/api/` requests to (see [`nginx.conf.template`](nginx.conf.template)); `VITE_API_URL` (default `/api`) is baked into the build at image-build time, not changeable at container runtime.

To run frontend and backend together, use the `docker-compose.yml` one level up in the repo root — see the [root README](../README.md).

## Project Structure

```
src/
├── api
├── assets/
├── Components/
├── Pages/
├── hooks/
├── services/
├── styles/
├── utils/
└── main.jsx
```

## Tech Stack

* React
* Vite
* Bun
* Axios
* React Router
* Bootstrap 5

## License

This project is intended for internal company use.

```
```
