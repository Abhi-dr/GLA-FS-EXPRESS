# Request Flow

## 1. Server start kaise hota hai?

```text
node server.js
    |
    v
.env ki values load hoti hain
    |
    v
Express app, routes aur middleware set hote hain
    |
    v
MongoDB Atlas se connection
    |
    +-- connection fail -> server start nahi hota
    |
    +-- connection success -> app.listen() server chala deta hai
```

## 2. Register ka flow

```text
POST /api/auth/register
    |
    v
express.json() request ke JSON ko req.body mein rakhta hai
    |
    v
name, email aur password check hote hain
    |
    v
email lowercase hota hai
    |
    v
check hota hai ki email pehle se hai ya nahi
    |
    v
bcrypt.hash() password ka hash banata hai
    |
    v
User.create() MongoDB mein user save karta hai
    |
    v
201 response: user ki details, password nahi
```

Password hash ko original password mein wapas convert nahi karte. Login ke waqt bcrypt entered password ko saved hash se compare karta hai.

## 3. Login aur JWT ka flow

```text
POST /api/auth/login
    |
    v
email se user search hota hai
    |
    v
.select("+password") se password hash milta hai
    |
    v
bcrypt.compare() password check karta hai
    |
    +-- galat -> 401 response
    |
    +-- sahi -> jwt.sign() token banata hai
                    |
                    v
              token client ko milta hai
```

JWT ke `sub` field mein user ki ID rakhi gayi hai. JWT signed hota hai, encrypted nahi; isliye ismein password nahi rakhna.

## 4. Protected request ka flow

```text
GET /api/tasks
Authorization: Bearer <token>
    |
    v
task router ka authenticate middleware chalta hai
    |
    v
jwt.verify() token aur expiry check karta hai
    |
    +-- token galat/expired -> 401
    |
    +-- token sahi -> req.user.id set hoti hai
                          |
                          v
                    task route chalta hai
                          |
                          v
                    Task.find({ owner: req.user.id })
                          |
                          v
                    sirf us user ke tasks response mein aate hain
```

`req.user` Express ka built-in object nahi hai. Hum token verify karne ke baad khud ismein user ki ID rakhte hain.

## 5. CRUD ka flow

### Create — `POST /api/tasks`

1. JWT middleware user ko verify karta hai.
2. Route title aur description check karta hai.
3. `Task.create()` naya document save karta hai.
4. `owner` token se liya jaata hai, client ke JSON se nahi.

### Read — `GET /api/tasks` aur `GET /api/tasks/:id`

- `Task.find({ owner: req.user.id })` logged-in user ke saare tasks laata hai.
- `Task.findOne({ _id: req.params.id, owner: req.user.id })` ek specific task tabhi laata hai jab ID aur owner dono match karein.

### Update — `PATCH /api/tasks/:id`

1. URL mein task ID validate hoti hai.
2. Sirf `title`, `description` aur `status` update karne dete hain.
3. `findOneAndUpdate()` task ID aur owner dono match karta hai.
4. `new: true` updated document return karta hai.

### Delete — `DELETE /api/tasks/:id`

`findOneAndDelete()` task ID aur owner dono match hone par hi document delete karta hai.

## 6. Middleware ka order

```text
express.json()
    |
    v
health endpoint aur API routes
    |
    v
notFound
    |
    v
errorHandler
```

- `express.json()` request body parse karta hai.
- `authenticate` protected routes par token check karta hai.
- `notFound` tab chalta hai jab URL ka route nahi milta.
- `errorHandler` route ya database se aayi error ko response mein badalta hai.

## 7. Common cheezein

- `req.body` — client ne JSON body mein jo data bheja.
- `req.params.id` — URL mein `:id` ki jagah aayi value.
- `req.headers.authorization` — request ka Authorization header.
- `next()` — request ko agle middleware/handler tak bhejta hai.
- `await` — Promise ka result aane tak async function ko wait karata hai.
- `Schema` — document ke fields aur unke rules define karta hai.
- `Model` — MongoDB collection par query/create/update/delete karne ka interface hai.
- `ObjectId` — MongoDB document ki ID ka common format hai.
- `401` — token missing ya invalid hai.
- `404` — route ya requested task nahi mila.
