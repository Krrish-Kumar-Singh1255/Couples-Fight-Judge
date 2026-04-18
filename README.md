# ⚖️ Couple Fight Judge

**"Fair verdict. Unfair outcome."**

Couple Fight Judge is a fun, AI-powered web application where couples present their arguments and a virtual **Relationship Court Judge** delivers a dramatic and analytical verdict.

---

## 🚀 Features

* 🧑‍⚖️ AI-powered verdicts using Google Gemini
* 📊 Fault percentage breakdown (Boy vs Girl)
* 🎭 Dramatic judge remarks & evidence points
* 🔁 Smart caching for faster repeated results
* 🎨 Smooth animations with Framer Motion
* 📱 Responsive and interactive UI
* 📋 Shareable verdict output

---

## 🛠️ Tech Stack

### Frontend

* React + TypeScript
* Tailwind CSS
* Framer Motion
* Lucide Icons

### Backend

* Node.js + Express
* Google Generative AI (Gemini API)
* dotenv

---

## 📂 Project Structure

```bash
Couple-Fight-Judge/
│── client/
│   │── App.tsx
│   │── main.tsx
│   │── index.css
│
│── server/
│   │── index.js
│
│── package.json
│── README.md
│── .env.example
```

---

## ⚙️ How It Works

1. Users enter both sides of a couple's fight
2. The data is sent to a backend API
3. Backend forwards the request to Gemini AI
4. AI analyzes the situation based on:

   * Logic
   * Emotional context
   * Relationship behavior
5. A structured verdict is returned with:

   * Fault percentage
   * Evidence points
   * Judge remarks

---

## 🔧 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/couple-fight-judge.git
cd couple-fight-judge
```

### 2. Install dependencies

```bash
npm install
```

For backend:

```bash
cd server
npm install
```

---

### 3. Environment Variables

Create a `.env` file inside the `server` folder:

```env
VITE_GOOGLE_API_KEY=your_api_key_here
```

Example (`.env.example`):

```env
VITE_GOOGLE_API_KEY=YOUR_API_KEY
```

---

### 4. Run the Project

#### Frontend

```bash
npm run dev
```

#### Backend

```bash
cd server
node index.js
```

---

## 🎮 Usage

1. Click **"Settle This Fight"**
2. Enter both sides of the story
3. Submit to the judge ⚖️
4. Get your verdict and sentence 😈

---

## 📌 Future Improvements

* 🌐 Live deployment (Frontend + Backend)
* 🔗 Shareable public links
* 📊 Enhanced AI reasoning
* 😂 More dynamic and funny verdicts

---

## ⚠️ Disclaimer

> This verdict is legally binding in **0 countries**.

---

## 👨‍💻 Author

**Krrish Kumar Singh**
🚀 Team: **Night Owls**

---

## ⭐ Support

If you like this project:

* ⭐ Star the repo
* 🍴 Fork it
* 📢 Share it

---

🔥 *Because every couple needs a judge... but not a fair one.*
