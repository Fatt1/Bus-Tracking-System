# Bus-Tracking-System – Project Overview

This document summarizes the architecture, key modules, and technology stack of the repository to speed up future Q&A and development.

## Backend (ASP.NET Core)

- Solution: `backend/TrackingBusSystemSolution/TrackingBusSystemSolution.sln`
- Projects:
  - Domain: `TrackingBusSystem.Domain`
  - Application: `TrackingBusSystem.Application` (MediatR/CQRS, AutoMapper)
  - Infrastructure: `TrackingBusSystem.Infrastructure` (EF Core, Identity, JWT, SignalR, Repositories)
  - Presentation: `TrackingBusSystem.Presentation` (Web API Controllers)

### Entry & configuration
- Entry: `TrackingBusSystem.Presentation/Program.cs`
  - Adds Controllers, Swagger, CORS, SignalR, JWT Auth
  - Registers Infrastructure and Application service containers
  - Maps controllers and SignalR hubs via `UseInfrastructureService()`
- App settings: `appsettings.json`, `appsettings.Development.json`
  - Connection string `DefaultConnection` (SQL Server)
  - `Jwt:SecretKey` used by JWT validation
- CORS: allows `http://localhost:5173` (Vite) and `http://127.0.0.1:5500`

### DI and Services
- Application DI: `Application/Dependency Injection/ServiceContainer.cs`
  - Registers AutoMapper profile `MappingConfig`
  - Registers MediatR handlers from Application assembly
  - Registers `ITokenService`, `IScheduleValidationService`
- Infrastructure DI: `Infrastructure/Dependency Injection/ServiceContainer.cs`
  - EF Core: `AppDbContext` (SQL Server)
  - ASP.NET Identity with `AppUser`
  - JWT Authentication reading `Jwt:SecretKey` (token read from HttpOnly cookie `access_token`)
  - Repositories: `IRouteRepository`, `IDriverRepository`, `IScheduleRepository`, `IBusRepository`, `IStudentRepository`
  - SignalR hubs mapped at `/geolocationHub` and `/notificationHub`

### Domain model (Entities)
Located in `Domain/Entities/`:
- `AppUser`, `Driver`, `Student`, `StudentCheckingHistory`
- `Bus`, `BusLastLocation`
- `Route`, `StopPoint`
- `Schedule`
- `Announcement`, `UserAnnouncement`

### Mapping
- AutoMapper profile: `Application/Mapping/MappingConfig.cs` maps domain entities to DTOs and commands to entities (e.g., `UpdateScheduleByIdCommand -> Schedule`).

### API Surface (examples)
- Route endpoints: `Presentation/Controllers/RouteController.cs`
  - `GET /api/v1/route/all`
  - `GET /api/v1/route/{id}`
  - `GET /api/v1/route/{id}/students`
- Auth endpoints: `Presentation/Controllers/AuthController.cs`
  - `POST /api/v1/auth/login` (returns token, also sets HttpOnly cookie `access_token`)
  - `POST /api/v1/auth/logout`
  - `POST /api/v1/auth/create-admin`

## Frontend (React + Vite)

- App root: `frontend/Bus-Tracking-System`
- Tooling: Vite 7, React 19, React Router 7, ESLint
- Realtime & Maps:
  - SignalR client: `@microsoft/signalr`
  - Mapping: `leaflet`, `react-leaflet`, `leaflet-routing-machine`
- Key config:
  - `vite.config.js` with React plugin
  - Packages: see `frontend/Bus-Tracking-System/package.json`

### App structure
- Entry: `src/main.jsx` (uses `BrowserRouter`)
- Routes: `src/App.jsx`
  - Public: `/login`, driver pages under `/driver/*`
  - Admin layout `src/components/Layout.jsx` wrapping `/` with nested routes (dashboard, buses, schedules, students, drivers, routes, notifications)
- Pages: `src/pages/*` including admin and driver UIs
- Shared components: `src/components/SideBar.jsx`, `Layout.jsx`, `MapComponent.jsx`

### Map and realtime location
- `src/components/MapComponent.jsx`
  - Draws route polyline + stop markers via Leaflet Routing Machine
  - Creates a bus marker and updates its position in realtime via SignalR
  - Connects to backend hub at `https://localhost:7229/geolocationHub`
  - Simulates movement by generating waypoints from selected route, then periodically invoking `SendLocation(busId, lat, lng)` on the hub

## Integration points
- API base used in frontend (example from code): `https://localhost:7229` (adjust to match backend runtime)
- CORS is enabled for `http://localhost:5173` so dev frontend can call the backend
- Auth: JWT stored in HttpOnly cookie `access_token`; backend reads token from cookie in JWT bearer events

## How to ask targeted questions
- Reference exact files and paths (e.g., `backend/.../RouteController.cs`)
- Mention endpoints or features (e.g., "how does schedule update work?")
- For frontend, point to a page/component (e.g., `src/pages/TripListPage.jsx` or `src/components/MapComponent.jsx`)

## Next helpful improvements
- Add a top-level README summarizing both backend and frontend (this doc can be adapted)
- Add environment configuration (API base URL) to `.env` and use Vite envs
- Add minimal integration tests for critical endpoints (routes, auth, schedules)
- Document SignalR hub methods and payload shapes
