# Product API

RESTful API CRUD quản lý Product sử dụng:

- Node.js
- Express.js
- MongoDB
- Mongoose
- Docker
- Docker Compose
- GitHub Actions
- Docker Hub
- Self-hosted GitHub Actions Runner

Product gồm các thuộc tính:

```text
pid
pname
price
quantity
```

---

# 1. Yêu cầu môi trường

Trước khi bắt đầu cần cài đặt:

- Git
- Git Bash
- Visual Studio Code
- Node.js
- Docker Desktop
- Docker Extension cho Visual Studio Code
- Tài khoản GitHub
- Tài khoản Docker Hub

Kiểm tra các công cụ:

```bash
git --version
node --version
npm --version
docker --version
docker compose version
```

Kiểm tra Docker Engine:

```bash
docker info
```

Nếu Docker hoạt động bình thường thì không được xuất hiện lỗi:

```text
Cannot connect to the Docker daemon
```

---

# 2. Repository GitHub

Repository của dự án:

```text
https://github.com/Ngyenvan/product-api
```

Tên repository:

```text
product-api
```

---

# 3. Clone repository bằng Git Bash trong Visual Studio Code

Mở Visual Studio Code.

Chọn:

```text
Terminal
→ New Terminal
```

Sử dụng Git Bash và chạy:

```bash
git clone https://github.com/Ngyenvan/product-api.git
```

Đi vào thư mục project:

```bash
cd product-api
```

Mở project bằng VS Code:

```bash
code .
```

Kiểm tra remote repository:

```bash
git remote -v
```

---

# 4. Kết nối Docker Desktop với Visual Studio Code

Khởi động Docker Desktop.

Trong Visual Studio Code cài extension:

```text
Docker
```

Sau đó kiểm tra:

```bash
docker ps
```

Nếu Docker Engine hoạt động, terminal sẽ hiển thị danh sách container hoặc bảng rỗng mà không báo lỗi.

---

# 5. Tạo MongoDB container cơ bản

Tạo container MongoDB với tên chính xác:

```text
nammongodb
```

Chạy:

```bash
docker run -d \
  --name nammongodb \
  -p 27017:27017 \
  mongo:8.0
```

Kiểm tra:

```bash
docker ps
```

Kiểm tra MongoDB:

```bash
docker exec nammongodb mongosh --quiet --eval "db.adminCommand('ping')"
```

Kết quả mong đợi:

```text
{ ok: 1 }
```

Sau khi kiểm tra xong, xóa container standalone để tránh trùng tên khi sử dụng Docker Compose:

```bash
docker rm -f nammongodb
```

---

# 6. Product RESTful API CRUD

Product API hỗ trợ các chức năng:

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/products` | Thêm Product |
| GET | `/api/products` | Lấy danh sách Product |
| GET | `/api/products/:pid` | Tìm Product theo pid |
| PUT | `/api/products/:pid` | Cập nhật Product |
| DELETE | `/api/products/:pid` | Xóa Product |

Product gồm:

```text
pid
pname
price
quantity
```

Ví dụ Product:

```json
{
  "pid": "P001",
  "pname": "Blue Pen",
  "price": 10000,
  "quantity": 20
}
```

---

# 7. Cấu hình `.env`

Project không commit file `.env` thật lên GitHub.

Tạo `.env` từ file mẫu:

```bash
cp .env.example .env
```

Nội dung mặc định:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/productdb
MONGO_URI_COMPOSE=mongodb://mongodb:27017/productdb
```

Trong đó:

```text
MONGO_URI
```

được dùng khi chạy Node.js trực tiếp trên máy.

Còn:

```text
MONGO_URI_COMPOSE
```

được dùng khi Product API chạy trong Docker Compose.

---

# 8. Cài đặt dependencies

Chạy:

```bash
npm install
```

Kiểm tra:

```bash
npm test
```

Project có bộ test Jest + Supertest dùng để kiểm tra CRUD API.

---

# 9. Chạy Product API ngoài Docker

Trước tiên cần MongoDB đang chạy tại:

```text
mongodb://127.0.0.1:27017
```

Sau đó chạy:

```bash
npm start
```

API mặc định chạy tại:

```text
http://localhost:3000
```

Kiểm tra health endpoint:

```bash
curl http://localhost:3000/health
```

Kết quả:

```json
{
  "status": "ok"
}
```

---

# 10. Dockerize Product API

Build Docker image:

```bash
docker build -t product-api:local .
```

Kiểm tra:

```bash
docker images
```

Phải có image:

```text
product-api   local
```

Dockerfile sử dụng Node.js Alpine và chỉ cài production dependencies:

```text
npm ci --omit=dev
```

---

# 11. Chạy bằng Docker Compose

Project sử dụng:

```text
docker-compose.yaml
```

Chạy:

```bash
docker compose -f docker-compose.yaml up -d --build
```

Kiểm tra:

```bash
docker compose -f docker-compose.yaml ps
```

Hệ thống gồm hai container:

```text
nammongodb
product-api
```

Kiến trúc:

```text
Product API
     |
     | mongodb://mongodb:27017/productdb
     v
MongoDB
```

---

# 12. Healthcheck MongoDB và Product API

Docker Compose cấu hình healthcheck cho cả hai container.

Kiểm tra MongoDB:

```bash
docker inspect --format='{{.State.Health.Status}}' nammongodb
```

Kết quả mong đợi:

```text
healthy
```

Kiểm tra Product API:

```bash
docker inspect --format='{{.State.Health.Status}}' product-api
```

Kết quả mong đợi:

```text
healthy
```

Kiểm tra HTTP:

```bash
curl http://localhost:3000/health
```

Kết quả:

```json
{
  "status": "ok"
}
```

---

# 13. CI với GitHub Actions

Workflow nằm tại:

```text
.github/workflows/productci.yml
```

Workflow được kích hoạt khi:

```text
push → main
```

hoặc:

```text
pull request → main
```

CI không chỉ chạy source code trực tiếp mà thực sự dựng môi trường Docker:

```text
GitHub Actions
      |
      v
docker compose up --build
      |
      +---- nammongodb
      |
      +---- product-api
```

Sau đó workflow chờ:

```text
MongoDB → healthy
Product API → healthy
```

---

# 14. CRUD test trên container triển khai thực tế

Sau khi hai container healthy, GitHub Actions thực hiện CRUD bằng HTTP thật.

## CREATE

```bash
curl \
  -X POST \
  http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "pid":"CI001",
    "pname":"CI Pen",
    "price":10000,
    "quantity":20
  }'
```

## READ ALL

```bash
curl http://localhost:3000/api/products
```

## READ ONE

```bash
curl http://localhost:3000/api/products/CI001
```

## UPDATE

```bash
curl \
  -X PUT \
  http://localhost:3000/api/products/CI001 \
  -H "Content-Type: application/json" \
  -d '{
    "pname":"CI Pen Updated",
    "price":15000,
    "quantity":50
  }'
```

## DELETE

```bash
curl \
  -X DELETE \
  http://localhost:3000/api/products/CI001
```

Workflow còn kiểm tra lại danh sách Product để chắc chắn `CI001` đã bị xóa.

Quy trình CI:

```text
Build Docker image
       |
       v
Start MongoDB
       |
       v
MongoDB healthy
       |
       v
Start Product API
       |
       v
Product API healthy
       |
       v
CREATE
       |
       v
READ
       |
       v
UPDATE
       |
       v
DELETE
       |
       v
CI PASS
```

---

# 15. Docker Hub

Tạo repository trên Docker Hub:

```text
product-api
```

Trong GitHub repository vào:

```text
Settings
→ Secrets and variables
→ Actions
```

Tạo hai Repository Secrets:

```text
DOCKERHUB_USERNAME
```

và:

```text
DOCKERHUB_TOKEN
```

Không đặt Docker Hub password trực tiếp trong workflow.

Sau khi CI thành công, chính Docker image vừa được healthcheck và CRUD test sẽ được tag:

```text
<DOCKERHUB_USERNAME>/product-api:latest
```

và:

```text
<DOCKERHUB_USERNAME>/product-api:<github-sha>
```

Sau đó image được push lên Docker Hub.

Quy trình:

```text
product-api:local
       |
       | healthcheck PASS
       | CRUD PASS
       v
docker tag
       |
       v
Docker Hub
```

---

# 16. Production Docker Compose

Production sử dụng:

```text
docker-compose-prod.yaml
```

Khác với development Compose, file production không build API từ source code.

Nó lấy image trực tiếp từ Docker Hub:

```text
${DOCKERHUB_USERNAME}/product-api:latest
```

Ví dụ trong Git Bash:

```bash
export DOCKERHUB_USERNAME=Ngyenvan
```

Pull image:

```bash
docker compose -f docker-compose-prod.yaml pull
```

Chạy production:

```bash
docker compose -f docker-compose-prod.yaml up -d
```

Kiểm tra:

```bash
docker compose -f docker-compose-prod.yaml ps
```

Kết quả mong đợi:

```text
nammongodb    healthy
product-api   healthy
```

---

# 17. Continuous Deployment về Local Docker Engine

Hệ thống sử dụng self-hosted GitHub Actions Runner trên máy Windows có Docker Desktop.

Trong GitHub:

```text
Settings
→ Actions
→ Runners
→ New self-hosted runner
```

Chọn:

```text
Windows
x64
```

Sau khi runner được cấu hình, chạy:

```powershell
.\run.cmd
```

Runner trên GitHub phải ở trạng thái:

```text
Idle
```

với các label:

```text
self-hosted
Windows
X64
```

Docker Desktop phải đang chạy trên máy chứa self-hosted runner.

---

# 18. Quy trình CD tự động

Sau khi CI thành công:

```text
GitHub Actions
      |
      v
Docker Hub
      |
      v
Self-hosted Windows Runner
      |
      v
docker-compose-prod.yaml
      |
      v
Local Docker Engine
```

Self-hosted runner thực hiện:

```text
docker compose pull
```

để lấy image mới nhất từ Docker Hub.

Sau đó:

```text
docker compose up -d
```

để cập nhật container trên Local Docker Engine.

Workflow tiếp tục chờ:

```text
nammongodb → healthy
product-api → healthy
```

và kiểm tra:

```text
http://localhost:3000/health
```

---

# 19. Quy trình CI/CD hoàn chỉnh

Toàn bộ pipeline:

```text
Developer
   |
   | git push
   v
GitHub Repository
   |
   v
GitHub Actions
   |
   +-----------------------------+
   | CI                          |
   |                             |
   | Build Product API image     |
   |          |                  |
   |          v                  |
   | Start MongoDB               |
   |          |                  |
   |          v                  |
   | MongoDB healthy             |
   |          |                  |
   |          v                  |
   | Product API healthy         |
   |          |                  |
   |          v                  |
   | CRUD Test                   |
   |          |                  |
   |          v                  |
   | PASS                        |
   +-------------+---------------+
                 |
                 v
            Docker Hub
                 |
                 v
      Self-hosted GitHub Runner
                 |
                 v
        docker-compose-prod.yaml
                 |
                 v
          Local Docker Engine
                 |
          +------+------+
          |             |
          v             v
     nammongodb     product-api
       healthy       healthy
```

---

# 20. Dừng development containers

```bash
docker compose -f docker-compose.yaml down
```

Xóa cả volume:

```bash
docker compose -f docker-compose.yaml down -v
```

---

# 21. Dừng production containers

```bash
docker compose -f docker-compose-prod.yaml down
```

Nếu muốn xóa cả volume:

```bash
docker compose -f docker-compose-prod.yaml down -v
```

---

# 22. Cấu trúc project

```text
product-api/
│
├── .github/
│   └── workflows/
│       └── productci.yml
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   └── productController.js
│   │
│   ├── models/
│   │   └── Product.js
│   │
│   └── routes/
│       └── productRoutes.js
│
├── tests/
│   └── product.test.js
│
├── .env
├── .env.example
├── .gitignore
├── app.js
├── server.js
├── Dockerfile
├── docker-compose.yaml
├── docker-compose-prod.yaml
├── package.json
├── package-lock.json
└── README.md
```

Lưu ý:

```text
.env
node_modules/
```

không được commit lên GitHub.

---

# 23. Đối chiếu yêu cầu bài tập

| # | Yêu cầu | Trạng thái |
|---|---|---|
| 1 | Hướng dẫn cơ bản từng bước | ✅ |
| 2 | Repository `product-api` | ✅ |
| 3 | Clone bằng Git Bash trong VS Code | ✅ |
| 4 | Docker Desktop + VS Code | ✅ |
| 5 | MongoDB container `nammongodb` | ✅ |
| 6 | CRUD Product + Mongoose + `.env` | ✅ |
| 7 | Dockerize Product API | ✅ |
| 8 | Docker Compose | ✅ |
| 9 | Healthcheck MongoDB + Product API | ✅ |
| 10 | `.github/workflows/productci.yml` | ✅ |
| 11 | CRUD test trên phiên bản container thực tế | ✅ |
| 12 | CD Docker Hub + healthcheck trong CI | ✅ |
| 13 | `docker-compose-prod.yaml` dùng Docker Hub | ✅ |
| 14 | GitHub Actions → Docker Hub → Local Docker Engine | ✅ |

---

# 24. Kiểm tra cuối cùng

Sau khi push code lên GitHub:

```bash
git status
```

Sau đó:

```bash
git add .
```

Commit:

```bash
git commit -m "Add environment example and project documentation"
```

Push:

```bash
git push origin main
```

Vào:

```text
GitHub
→ product-api
→ Actions
```

Workflow cuối cùng cần có:

```text
CI - Docker Healthcheck and CRUD Test
✅

CD - Deploy to Local Docker Engine
✅
```

Cuối cùng trên máy self-hosted runner:

```bash
docker ps
```

phải thấy:

```text
nammongodb    healthy
product-api   healthy
```

Kiểm tra API:

```bash
curl http://localhost:3000/health
```

Kết quả:

```json
{
  "status": "ok"
}
```