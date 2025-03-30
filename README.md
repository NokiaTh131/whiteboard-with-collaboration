#  Whiteboard with Collaboration  

A **real-time collaborative whiteboard** built with **Next.js, WebSockets, TypeScript, and MongoDB**. This app lets multiple users draw together on a shared whiteboard, making it perfect for brainstorming, teaching, or just having fun!  

##  Features  

 **Real-time Collaboration** – See changes instantly as others draw.  
 **Multiple Drawing Tools** – Use a pen, eraser, and basic shapes.  
 **Session-Based Rooms** – Share a unique room link with friends or colleagues.  
 **User Data Storage** – Drawings are saved in **MongoDB**, so you won’t lose your work.  

##  Tech Stack  

- **Frontend**: Next.js, TypeScript, Tailwind CSS  
- **Backend**: Node.js, WebSockets  
- **Database**: MongoDB (for saving drawings & session data)  

## 🔧 Getting Started  

### Install Prerequisites  
Make sure you have:  
- **Node.js** (14+ recommended)  
- **MongoDB** (local or cloud, like MongoDB Atlas)  

### Clone the Repo  

```bash
git clone https://github.com/NokiaTh131/whiteboard-with-collaboration.git
cd whiteboard-with-collaboration
```

### Install Dependencies  

```bash
npm install
```

### Set Up Environment Variables  

Create a **.env.local** file and add your MongoDB connection string:  

```env
MONGODB_URI=mongodb+srv://your-user:your-password@your-cluster.mongodb.net/your-db
```

### Run the App  

```bash
npm run dev
```

Now, open **http://localhost:3000** and start drawing! 🎨  

## How to Use  

1️⃣ Open the whiteboard and start drawing.  
2️⃣ Share your room link to invite others.  
3️⃣ All changes are synced in **real-time** with WebSockets.  
4️⃣ Close the app? No worries! Your work is saved in **MongoDB**.  


## Acknowledgments  

- **[Next.js](https://nextjs.org/)** – Frontend framework  
- **[MongoDB](https://www.mongodb.com/)** – NoSQL database  
- **[WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)** – Real-time communication  
- **[Tailwind CSS](https://tailwindcss.com/)** – Styling  

---

Hope this makes your README more engaging and beginner-friendly! Let me know if you need any tweaks. 🚀
