# Inventory & Order Management System

Full-stack containerized app: **FastAPI** + **React/Vite** + **PostgreSQL**, styled to the Anthropic Claude warm-cream/coral design system.

---

## Quick Start (Docker Compose)

```bash
# 1. Clone repo
git clone <your-repo-url>
cd ethara-assesment

# 2. Create .env from example
cp .env.example .env   # edit credentials if desired

# 3. Start all services
docker compose up --build

# Services:
#   Frontend  → http://localhost:3000
#   Backend   → http://localhost:8000
#   API Docs  → http://localhost:8000/docs
```

---

## Project Structure

```
ethara-assesment/
├── docker-compose.yml
├── .env.example
├── render.yaml              # Render deployment blueprint
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py          # FastAPI app, CORS, lifespan
│       ├── config.py        # pydantic-settings
│       ├── database.py      # SQLAlchemy engine + session
│       ├── models/          # Product, Customer, Order, OrderItem
│       ├── schemas/         # Pydantic v2 request/response
│       └── routers/         # products, customers, orders, dashboard
│
└── frontend/
    ├── Dockerfile           # Node build → Nginx alpine
    ├── nginx.conf           # SPA routing fallback
    ├── vercel.json          # SPA rewrite for Vercel
    └── src/
        ├── styles/
        │   ├── tokens.css   # All DESIGN.md tokens as CSS custom properties
        │   └── global.css
        ├── components/      # Button, Card, Badge, Input, Modal, Toast, DataTable, TopNav, Footer
        ├── pages/           # Dashboard, Products, Customers, Orders, NewOrder, OrderDetail
        └── services/        # axios API clients (products, customers, orders, dashboard)
```

---

## API Reference

| Method | Path            | Description                   |
| ------ | --------------- | ----------------------------- |
| GET    | /health         | Health check                  |
| GET    | /dashboard      | Summary counts                |
| POST   | /products       | Create product                |
| GET    | /products       | List all products             |
| GET    | /products/{id}  | Get product                   |
| PUT    | /products/{id}  | Update product                |
| DELETE | /products/{id}  | Delete product                |
| POST   | /customers      | Create customer               |
| GET    | /customers      | List all customers            |
| GET    | /customers/{id} | Get customer                  |
| DELETE | /customers/{id} | Delete customer               |
| POST   | /orders         | Create order (deducts stock)  |
| GET    | /orders         | List all orders               |
| GET    | /orders/{id}    | Get order with items          |
| DELETE | /orders/{id}    | Cancel order (restores stock) |

Full interactive docs at `/docs` (Swagger UI) or `/redoc`.

---

## Business Rules

- SKU is unique — duplicate returns **409 Conflict**
- Customer email is unique — duplicate returns **409 Conflict**
- Stock cannot go below 0 — order with insufficient stock returns **400 Bad Request**
- Creating an order **atomically deducts stock** (row-level lock)
- Order total is **calculated by the backend** (unit_price × quantity per item)
- Cancelling an order **restores stock**

---

## Environment Variables

| Variable            | Description                              |
| ------------------- | ---------------------------------------- |
| `POSTGRES_USER`     | Database user                            |
| `POSTGRES_PASSWORD` | Database password                        |
| `POSTGRES_DB`       | Database name                            |
| `POSTGRES_HOST`     | DB host (use `db` in Docker Compose)     |
| `DATABASE_URL`      | Full SQLAlchemy connection string        |
| `CORS_ORIGINS`      | Comma-separated allowed origins          |
| `VITE_API_URL`      | Backend URL (set at frontend build time) |

---

## Deployment

### Backend → Render

1. Push code to GitHub
2. On Render: **New → Blueprint** → select `render.yaml`
3. Add a free **PostgreSQL** service on Render, copy the **Internal Database URL**
4. Set environment variables in the Render Web Service:
   - `DATABASE_URL` = Internal PostgreSQL URL from step 3
   - `CORS_ORIGINS` = `https://your-frontend.vercel.app`
5. Deploy — backend will be live at `https://your-service.onrender.com`

### Push Docker image to Docker Hub

```bash
docker build -t your-dockerhub-user/ethara-backend:latest ./backend
docker push your-dockerhub-user/ethara-backend:latest
```

Update `render.yaml` to use `image: your-dockerhub-user/ethara-backend:latest` instead of build context.

### Frontend → Vercel

1. Import the GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set environment variable: `VITE_API_URL` = `https://your-service.onrender.com`
4. Deploy — frontend will be live at `https://your-app.vercel.app`

---

## Design System

The UI implements the Anthropic Claude warm-editorial design tokens from `DESIGN.md`:

- **Canvas**: `#faf9f5` cream — warm, not pure white
- **Primary / Coral CTA**: `#cc785c`
- **Dark surfaces**: `#181715` (metric cards, code windows, footer)
- **Display font**: Cormorant Garamond (Copernicus substitute via Google Fonts)
- **Body font**: Inter (StyreneB substitute via Google Fonts)
- All tokens exposed as CSS custom properties in `src/styles/tokens.css`

---

## Tech Stack

| Layer            | Technology                                        |
| ---------------- | ------------------------------------------------- |
| Backend          | Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| Database         | PostgreSQL 16                                     |
| Frontend         | React 18, Vite, React Router, Axios               |
| Containerization | Docker, Docker Compose                            |
| Deployment       | Render (backend), Vercel (frontend)               |
