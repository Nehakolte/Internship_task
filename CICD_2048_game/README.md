# 2048 Game — Jenkins CI/CD Pipeline Demo

A static 2048 game used as the sample app for a complete Jenkins CI/CD pipeline:
Checkout → Build → Test → Package → Docker Build → Container Smoke Test → Push to Registry.

## 1. Run the app locally (sanity check, no Docker needed)
```bash
cd src
python3 -m http.server 8080
# open http://localhost:8080
```

## 2. Run the tests
```bash
npm test
```

## 3. Set up Jenkins locally (Docker-based — fastest option)
```bash
docker run -d --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --group-add $(stat -c '%g' /var/run/docker.sock) \
  jenkins/jenkins:lts-jdk17

# Get the initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```
- Open `http://localhost:8080`, paste the password, install **Suggested Plugins**.
- Also install: **Docker Pipeline**, **GitHub Integration**, **Pipeline: Stage View**.
- Jenkins needs the `docker` CLI inside its container to run the pipeline's Docker
  stages — the volume mount above (`docker.sock`) lets it use the host's Docker engine.

## 4. Connect Jenkins to GitHub
1. Push this project to a new GitHub repo:
   ```bash
   git remote add origin https://github.com/<your-username>/2048-jenkins-demo.git
   git add .
   git commit -m "Initial commit: 2048 app + Jenkins pipeline"
   git push -u origin main
   ```
2. In GitHub → repo **Settings → Webhooks → Add webhook**:
   - Payload URL: `http://<your-jenkins-host>:8080/github-webhook/`
   - Content type: `application/json`
   - Event: **Just the push event**
3. In Jenkins, create credentials for GitHub (if repo is private):
   **Manage Jenkins → Credentials → Add** → "Username with password" (use a GitHub PAT).

## 5. Add Docker Hub credentials to Jenkins
**Manage Jenkins → Credentials → System → Global credentials → Add Credentials**
- Kind: *Username with password*
- Username: your Docker Hub username
- Password: a Docker Hub **access token** (not your account password)
- ID: `dockerhub-creds`  ← must match the ID used in the `Jenkinsfile`

## 6. Create the Pipeline job
1. Jenkins Dashboard → **New Item** → name it `2048-pipeline` → type **Pipeline**.
2. Under **Build Triggers**, check **GitHub hook trigger for GITScm polling**.
3. Under **Pipeline**, choose **Pipeline script from SCM**:
   - SCM: Git
   - Repository URL: your GitHub repo URL
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
4. Save, then click **Build Now** for the first run (webhook drives all future runs).

## 7. Update the Jenkinsfile before your first run
Edit these two lines in `Jenkinsfile`:
```groovy
DOCKERHUB_USER = "your-dockerhub-username"
```
and make sure the credential ID `dockerhub-creds` matches what you created in step 5.

## 8. What each stage does
| Stage | Purpose |
|---|---|
| Checkout | Pulls the latest code from GitHub |
| Build | Validates project structure (`npm run build`) |
| Test | Runs 9 unit tests against the game logic (`npm test`) |
| Package | Copies static assets into `dist/` and archives them as Jenkins build artifacts |
| Docker Build | Builds the `nginx`-based image tagged with the Jenkins `BUILD_NUMBER` and `latest` |
| Container Smoke Test | Runs the image and curls it, failing the build if it doesn't return HTTP 200 |
| Push to Registry | Logs into Docker Hub and pushes both tags |

## 9. Run the built image
```bash
docker run -d -p 8080:80 -e APP_ENV=production <dockerhub-user>/2048-jenkins-demo:latest
# open http://localhost:8080
```

---

## Study notes: Blue-Green vs Rolling Deployment

### Blue-Green Deployment
Two identical, full-size environments exist side by side — **Blue** (currently live)
and **Green** (the new version). You deploy the new version entirely to Green while
Blue keeps serving all production traffic. Once Green passes smoke tests, a router/
load balancer switches traffic from Blue to Green **all at once**.
- **Pros:** near-zero downtime, instant rollback (just switch traffic back to Blue),
  the new version is fully tested in a production-like environment before going live.
- **Cons:** needs double the infrastructure while both environments exist; database/schema
  changes that aren't backward-compatible are tricky, since both versions may briefly
  need to work against the same data store.
- **Good fit for:** this 2048 app — since it's a stateless static site, you could run
  two container instances (`2048-blue`, `2048-green`) behind an nginx/Traefik reverse
  proxy and flip an upstream config value to cut over.

### Rolling Deployment
Instances of the new version are rolled out **gradually**, one (or a small batch) at
a time, replacing old instances while the rest keep serving traffic. There's no
separate "second environment" — you're updating the same fleet incrementally.
- **Pros:** no extra infrastructure needed, gradual rollout limits blast radius if a
  bug slips through (only a fraction of traffic hits the new version at first).
- **Cons:** rollback is slower (you have to roll back the same way you rolled forward),
  and for a short window both old and new versions serve traffic simultaneously —
  which is only safe if they're compatible with each other and the same data/API contracts.
- **Good fit for:** larger clustered deployments (e.g., Kubernetes `Deployment` objects
  default to rolling updates via `maxSurge`/`maxUnavailable` settings).

### Summary comparison
| | Blue-Green | Rolling |
|---|---|---|
| Downtime | Near zero | Near zero (if done carefully) |
| Rollback speed | Instant (flip traffic back) | Slower (roll forward again) |
| Infra cost | Double, temporarily | Same fleet size |
| Traffic during deploy | 100% old → 100% new (instant) | Mixed old+new during rollout |
| Complexity | Needs router/traffic-switch tooling | Needs orchestrator (k8s, ECS, etc.) |

For this exercise, a simple way to *simulate* Blue-Green locally is to run the new
image on a different port (`docker run -p 8082:80 ...`), verify it, then update an
nginx `upstream` block or a reverse-proxy config to point port 80 at 8082 instead of
the old 8081 — that config swap **is** the blue-green cutover.
