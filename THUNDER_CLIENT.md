# Thunder Client Requests

Base URL: `http://localhost:3000`

Protected routes par Authorization -> Bearer Token mein login se mila token paste karo.

## 1. User register karo

`POST /api/auth/register`

```json
{
  "name": "Rahul",
  "email": "rahul@example.com",
  "password": "StrongPass123"
}
```

## 2. Login karo

`POST /api/auth/login`

```json
{
  "email": "rahul@example.com",
  "password": "StrongPass123"
}
```

Response ka `token` copy karo.

## 3. Task create karo

`POST /api/tasks`

```json
{
  "title": "Express revise karna",
  "description": "Routes aur middleware revise karne hain",
  "status": "pending"
}
```

Task ka `_id` copy karo.

## 4. Apne saare tasks dekho

`GET /api/tasks`

## 5. Ek task dekho

`GET /api/tasks/PASTE_TASK_ID`

## 6. Task update karo

`PATCH /api/tasks/PASTE_TASK_ID`

```json
{
  "status": "completed"
}
```

## 7. Task delete karo

`DELETE /api/tasks/PASTE_TASK_ID`

## 8. Doosre user se access check karo

Alag email se doosra account banao, usse login karo aur uska token use karke pehle user ka task ID access karo. Response `404` aana chahiye.

## 9. Galat requests bhi try karo

- Token ke bina `GET /api/tasks` -> `401`
- Galat password se login -> `401`
- Required field ke bina register -> `400`
- Galat task ID -> `400`
- Pehle se registered email -> `409`
- Unknown URL -> `404`
