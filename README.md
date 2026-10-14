# StudyFlow API

Ye API users ko register/login karne aur apne tasks create, read, update aur delete karne deti hai.

## 1. Zaroori cheezein

- Node.js 20 ya usse naya version
- npm
- MongoDB Atlas account
- API requests bhejne ke liye Thunder Client

## 2. Project chalao

Terminal mein project folder ke andar ye commands chalao:

```bash
npm install
cp .env.example .env
```

Ab `.env` file kholo:

- `MONGO_URI` mein apna MongoDB Atlas connection string daalo.
- `JWT_SECRET` ko apni random, kam se kam 32 characters ki value se replace karo.
- `.env` ko GitHub par upload mat karna.

MongoDB Atlas mein database user banao aur Network Access mein apna current IP add karo. Phir Connect -> Drivers -> Node.js se connection string copy karo.

Server start karo:

```bash
npm run dev
```

Terminal mein MongoDB connection aur server URL ka message aana chahiye. Browser mein `http://localhost:3000/` kholo.

## 3. API endpoints

| Method | URL | Kaam |
|---|---|---|
| POST | `/api/auth/register` | Naya user banana |
| POST | `/api/auth/login` | Login karke JWT lena |
| POST | `/api/tasks` | Naya task banana |
| GET | `/api/tasks` | Apne saare tasks dekhna |
| GET | `/api/tasks/:id` | Apna ek task dekhna |
| PATCH | `/api/tasks/:id` | Apne task ki fields update karna |
| DELETE | `/api/tasks/:id` | Apna task delete karna |

Task waale sabhi endpoints par login ka Bearer token zaroori hai.

## 4. Thunder Client se test karo

Base URL: `http://localhost:3000`

### Step 1: Register

`POST /api/auth/register`

Body -> JSON:

```json
{
  "name": "Rahul",
  "email": "rahul@example.com",
  "password": "StrongPass123"
}
```

Account banne par `201` response milega. Password response mein nahi aayega.

### Step 2: Login

`POST /api/auth/login`

```json
{
  "email": "rahul@example.com",
  "password": "StrongPass123"
}
```

Response mein jo `token` mile, use copy karo.

### Step 3: Task banao

`POST /api/tasks`

Authorization -> Bearer Token mein login waala token paste karo.

Body -> JSON:

```json
{
  "title": "MongoDB seekhna",
  "description": "Collections aur documents samajhna",
  "status": "pending"
}
```

Response se task ka `_id` copy karo.

### Step 4: Apne saare tasks dekho

`GET /api/tasks`

Wahi Bearer token use karo.

### Step 5: Ek task dekho

`GET /api/tasks/PASTE_TASK_ID`

`PASTE_TASK_ID` ki jagah apna task `_id` lagao.

### Step 6: Task update karo

`PATCH /api/tasks/PASTE_TASK_ID`

```json
{
  "status": "completed"
}
```

Update ke liye `title`, `description` ya `status` mein se koi field bhej sakte ho.

### Step 7: Task delete karo

`DELETE /api/tasks/PASTE_TASK_ID`

### Step 8: Check karo ki users ek-doosre ke tasks nahi dekh sakte

1. Alag email se doosra user register karo.
2. Doosre user se login karke uska token copy karo.
3. Doosre token se pehle user ka task ID open/update/delete karne ki koshish karo.
4. API `404 Task nahi mila` return karegi.

## 5. Project ki files

- `server.js` — Express app, middleware order, routes aur server startup.
- `config/db.js` — MongoDB Atlas connection.
- `models/User.js` — User document ka structure.
- `models/Task.js` — Task document ka structure.
- `routes/auth.routes.js` — Register, login, password hashing aur JWT banana.
- `middleware/auth.js` — JWT verify karke logged-in user ki ID `req.user.id` mein rakhna.
- `routes/task.routes.js` — Task CRUD aur owner check.
- `middleware/notFound.js` — Galat URL ke liye 404 response.
- `middleware/errorHandler.js` — Database/validation errors ke response.
- `.env.example` — Environment variables ka example.
- `FLOW.md` — Request ka flow, step-by-step.
- `THUNDER_CLIENT.md` — Requests test karne ki short checklist.

## 6. Common status codes

- `200` — Request successful.
- `201` — Naya user ya task ban gaya.
- `400` — Request ka data galat hai.
- `401` — Token missing/invalid hai ya login details galat hain.
- `404` — Route ya task nahi mila.
- `409` — Email jaisi unique value pehle se maujood hai.
- `500` — Server par unexpected error aaya.

## 7. Dhyaan dene waali baatein

- Password database mein plain text mein save nahi hota; bcrypt hash save hota hai.
- JWT signed hota hai, encrypted nahi. Token ke payload mein password mat rakho.
- Task ka owner request body se nahi, verified token se decide hota hai.
- `.env` mein database password aur JWT secret hote hain, isliye ise GitHub par commit mat karo.
