# 💬 Real-Time Chat Application

A full-stack **real-time chat application** built with **Angular**, **Node.js**, **Socket.IO**, and **MongoDB**. It allows users to chat instantly, see online users, and track message statuses.

---

## 🚀 Features

* 🔐 **User Authentication** – Register and Login securely
* 💬 **Real-time Messaging** using Socket.IO
* 👀 **Message Status** – Pending, Sent, Seen
* ⌨️ **Typing Indicator** – Shows when someone is typing
* 👥 **Online Users List** – See who is online
* 🔄 **Reconnection Handling** – Automatic reconnect when connection drops
* 💾 **Message Persistence** – All messages stored in MongoDB
* 📜 **Chat History** – Load last 50 messages

---

## 🛠️ Tech Stack

### Frontend

* Angular
* Tailwind CSS

### Backend

* Node.js
* Express.js
* Socket.IO

### Database

* MongoDB

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/nabilaDev/live-chat-app.git
cd live-chat-app
```

### 2. Backend setup

```bash
cd backend
npm install
```

* Create a `.env` file with your environment variables (e.g., MongoDB URI, JWT secret)
* Run the server:

```bash
npm start
```

### 3. Frontend setup

```bash
cd frontend
npm install
ng serve
```

* Access the application at `http://localhost:4200`

---

## 📡 How it works

1. Users join a room via **Socket.IO**
2. Messages are sent in **real-time** and stored in **MongoDB**
3. Each message has a **status**:

   * `pending` → sending
   * `sent` → delivered
   * `seen` → read by receiver
4. When a user reconnects, **previous messages** are loaded from the database

---

## 🧠 Key Challenges Solved

* Handling **real-time updates** without page refresh
* Managing **socket reconnection** properly
* Avoiding **duplicate users** in rooms
* Syncing **message status (seen)**
* Keeping UI **reactive with Angular**

---

## 📌 Future Improvements

* Private chat (1-to-1)
* Push notifications
* Unread messages counter
* Last seen status

---

## 👨‍💻 Author

**SALHI NABILA**
