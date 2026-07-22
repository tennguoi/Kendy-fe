pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    skipDefaultCheckout(true)
    timestamps()

    buildDiscarder(
      logRotator(
        numToKeepStr: '10',
        artifactNumToKeepStr: '5'
      )
    )
  }

  environment {
    REGISTRY = 'docker.io'
    IMAGE_NAME = 'tennguoi2/kendy-frontend'

    DOCKERHUB_CREDENTIALS = 'dockerhub-push-credentials'

    VITE_API_BASE_URL = 'http://localhost:8080'

    APP_DIR_LINUX = '/opt/kendy'
    APP_DIR_WIN = 'C:/Kendy-deploy'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm

        script {
          env.IMAGE_TAG = "dev-${env.BUILD_NUMBER}"

          env.FRONTEND_IMAGE =
            "${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"

          env.APP_DIR = isUnix()
            ? env.APP_DIR_LINUX
            : env.APP_DIR_WIN

          env.TRIVY_CACHE_DIR =
            "${env.WORKSPACE}/.trivy-cache"

          echo """
Hệ điều hành : ${isUnix() ? 'Linux' : 'Windows'}
Frontend image: ${env.FRONTEND_IMAGE}
API URL       : ${env.VITE_API_BASE_URL}
Deploy folder : ${env.APP_DIR}
""".stripIndent()

          if (isUnix()) {
            sh '''
              mkdir -p "$TRIVY_CACHE_DIR"
            '''
          } else {
            powershell '''
              $ErrorActionPreference = 'Stop'

              New-Item `
                -ItemType Directory `
                -Force `
                -Path $env:TRIVY_CACHE_DIR |
                Out-Null
            '''
          }
        }
      }
    }

    stage('Install') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              npm ci --legacy-peer-deps
            '''
          } else {
            bat '''
              @echo off
              call npm ci --legacy-peer-deps
            '''
          }
        }
      }
    }

    stage('Lint') {
      steps {
        script {
          int lintStatus

          if (isUnix()) {
            lintStatus = sh(
              returnStatus: true,
              script: '''
                npm run lint
              '''
            )
          } else {
            lintStatus = bat(
              returnStatus: true,
              script: '''
                @echo off
                call npm run lint
              '''
            )
          }

          if (lintStatus != 0) {
            echo '⚠️ Lint có lỗi nhưng pipeline vẫn tiếp tục.'
          } else {
            echo '✅ Lint thành công.'
          }
        }
      }
    }

    stage('Build') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              npm run build
            '''
          } else {
            bat '''
              @echo off
              call npm run build
            '''
          }
        }
      }
    }

    stage('Build Image') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              docker buildx build \
                --load \
                --file Dockerfile.prod \
                --build-arg "VITE_API_BASE_URL=$VITE_API_BASE_URL" \
                --tag "$FRONTEND_IMAGE" \
                .
            '''
          } else {
            bat '''
              @echo off

              docker buildx build ^
                --load ^
                --file Dockerfile.prod ^
                --build-arg "VITE_API_BASE_URL=%VITE_API_BASE_URL%" ^
                --tag "%FRONTEND_IMAGE%" ^
                .
            '''
          }
        }
      }
    }

    stage('Scan Image') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              trivy image \
                --cache-dir "$TRIVY_CACHE_DIR" \
                --exit-code 1 \
                --severity HIGH,CRITICAL \
                --timeout 20m \
                --scanners vuln \
                "$FRONTEND_IMAGE"
            '''
          } else {
            bat '''
              @echo off

              trivy image ^
                --cache-dir "%TRIVY_CACHE_DIR%" ^
                --exit-code 1 ^
                --severity HIGH,CRITICAL ^
                --timeout 20m ^
                --scanners vuln ^
                "%FRONTEND_IMAGE%"
            '''
          }
        }
      }
    }

    stage('Push Image') {
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: env.DOCKERHUB_CREDENTIALS,
            usernameVariable: 'REGISTRY_USER',
            passwordVariable: 'REGISTRY_PASSWORD'
          )
        ]) {
          script {
            if (isUnix()) {
              sh '''
                set -eu

                printf '%s' "$REGISTRY_PASSWORD" |
                  docker login "$REGISTRY" \
                    --username "$REGISTRY_USER" \
                    --password-stdin

                docker push "$FRONTEND_IMAGE"
              '''
            } else {
              bat '''
                @echo off

                echo Dang dang nhap Docker Hub voi user %REGISTRY_USER%...

                <nul set /p "=%REGISTRY_PASSWORD%" | docker login "%REGISTRY%" ^
                  --username "%REGISTRY_USER%" ^
                  --password-stdin

                if errorlevel 1 (
                  echo Docker Hub login that bai.
                  exit /b 1
                )

                echo Dang push image %FRONTEND_IMAGE%...

                docker push "%FRONTEND_IMAGE%"

                if errorlevel 1 (
                  echo Docker push that bai.
                  exit /b 1
                )
              '''
            }
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -eu

              DEPLOY_FILE="$APP_DIR/deploy.sh"

              if [ ! -f "$DEPLOY_FILE" ]; then
                echo "Không tìm thấy file: $DEPLOY_FILE"
                exit 1
              fi

              echo "Deploy frontend image: $FRONTEND_IMAGE"
              echo "Deploy folder: $APP_DIR"

              FRONTEND_IMAGE="$FRONTEND_IMAGE" \
              APP_DIR="$APP_DIR" \
              sh "$DEPLOY_FILE"
            '''
          } else {
            powershell '''
              $ErrorActionPreference = 'Stop'

              $deployFile =
                Join-Path $env:APP_DIR 'deploy.ps1'

              if (-not (Test-Path $deployFile)) {
                throw "Không tìm thấy file: $deployFile"
              }

              Write-Host "Deploy frontend image: $env:FRONTEND_IMAGE"
              Write-Host "Deploy folder: $env:APP_DIR"

              & $deployFile

              if ($LASTEXITCODE -ne 0) {
                throw "Deploy frontend thất bại, exit code: $LASTEXITCODE"
              }
            '''
          }
        }
      }
    }
  }

  post {
    always {
      script {
        if (isUnix()) {
          sh(
            returnStatus: true,
            script: '''
              docker logout docker.io >/dev/null 2>&1 || true
            '''
          )
        } else {
          bat(
            returnStatus: true,
            script: '''
              @echo off
              docker logout docker.io >nul 2>&1
              exit /b 0
            '''
          )
        }
      }
    }

    success {
      echo '✅ Frontend pipeline hoàn thành thành công!'
    }

    failure {
      echo '❌ Frontend pipeline thất bại. Kiểm tra stage màu đỏ.'
    }
  }
}