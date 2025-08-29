# 🖼️ HTLGram Media Server  

**HTLGram-Mediaserver** is a part of the [HTLGram Backend](https://github.com/Leu3ery/HTLGram).  
It is responsible for **handling and serving media files** (photos, videos, documents) uploaded in chats.  
Although designed to work together with the [Main Server](https://github.com/Leu3ery/HTLGram),  
it can also be started **as a standalone service** for development or testing purposes.  

---

## ⚙️ Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Leu3ery/HTLGram-Mediaserver.git
cd HTLGram-Mediaserver
npm install

### 3. Create .env files

```bash
PORT=8001
JWT_SECRET=jwt_secret
MONGO_URI=mongodb://localhost/dbname
MAX_FILE_SIZE=50
MAX_USER_STORAGE=1000
PUBLIC_KEY_PATH=jwtRS256.key.pub
PUBLIC_KEY_BASE64=yourPublicKay
```

### 4. Run servers

Media server:
```bash
npx tsc
node dist/server.js
```

## 🤝 Contributing

Feel free to fork and submit a pull request. Ideas and improvements are welcome!

## 📜 License

MIT License.