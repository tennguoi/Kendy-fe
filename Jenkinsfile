pipeline {
  agent any

  environment {
    REGISTRY              = 'docker.io'
    IMAGE_NAME            = 'tennguoi2/kendy-frontend'
    IMAGE_TAG             = "dev-${env.BUILD_NUMBER}"
    DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
    VITE_API_BASE_URL     = 'http://localhost:8080'
    APP_DIR_LINUX         = '/Kendy-deploy'
    APP_DIR_WIN           = 'C:/Kendy-deploy'
    // Cache riêng cho Trivy để tránh xung đột
    TRIVY_CACHE_DIR       = "${WORKSPACE}/.trivy-cache"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.FRONTEND_IMAGE = "${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
          env.APP_DIR = isUnix() ? env.APP_DIR_LINUX : env.APP_DIR_WIN
          echo "Đang chạy trên: ${isUnix() ? 'Linux' : 'Windows'} | APP_DIR = ${env.APP_DIR}"
          // Tạo thư mục cache nếu chưa có
          if (isUnix()) {
            sh "mkdir -p ${env.TRIVY_CACHE_DIR}"
          } else {
            bat "if not exist ${env.TRIVY_CACHE_DIR} mkdir ${env.TRIVY_CACHE_DIR}"
          }
        }
      }
    }

    stage('Install') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci --legacy-peer-deps'
          } else {
            bat 'npm ci --legacy-peer-deps'
          }
        }
      }
    }

    stage('Lint') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run lint || true'
          } else {
            bat 'cmd /c "npm run lint || exit 0"'
          }
        }
      }
    }

    stage('Build') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run build'
          } else {
            bat 'npm run build'
          }
        }
      }
    }

    stage('Build Image') {
      steps {
        script {
          if (isUnix()) {
            sh 'docker build -f Dockerfile.prod --build-arg VITE_API_BASE_URL="$VITE_API_BASE_URL" -t "$FRONTEND_IMAGE" .'
          } else {
            bat "docker build -f Dockerfile.prod --build-arg VITE_API_BASE_URL=%VITE_API_BASE_URL% -t %FRONTEND_IMAGE% ."
          }
        }
      }
    }

    stage('Scan Image') {
      steps {
        script {
          // Sử dụng cache riêng và tăng timeout lên 20 phút
          if (isUnix()) {
            sh """
              TRIVY_CACHE_DIR="${TRIVY_CACHE_DIR}" trivy image \
                --exit-code 1 \
                --severity HIGH,CRITICAL \
                --timeout 20m \
                --scanners vuln \
                "$FRONTEND_IMAGE"
            """
          } else {
            bat """
              set TRIVY_CACHE_DIR=${TRIVY_CACHE_DIR}
              trivy image --exit-code 1 --severity HIGH,CRITICAL --timeout 20m --scanners vuln %FRONTEND_IMAGE%
            """
          }
        }
      }
    }

    stage('Push Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIALS, usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_PASSWORD')]) {
          script {
            if (isUnix()) {
              sh 'echo "$REGISTRY_PASSWORD" | docker login "$REGISTRY" -u "$REGISTRY_USER" --password-stdin'
              sh 'docker push "$FRONTEND_IMAGE"'
            } else {
              bat "echo %REGISTRY_PASSWORD% | docker login %REGISTRY% -u %REGISTRY_USER% --password-stdin"
              bat "docker push %FRONTEND_IMAGE%"
            }
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        script {
          if (isUnix()) {
            sh """
              FRONTEND_IMAGE="\${FRONTEND_IMAGE}" APP_DIR="\${APP_DIR}" "\${APP_DIR}/deploy.sh"
            """
          } else {
            bat """
              set FRONTEND_IMAGE=%FRONTEND_IMAGE%
              set APP_DIR=%APP_DIR%
              powershell -ExecutionPolicy Bypass -File "%APP_DIR%\\deploy.ps1"
            """
          }
        }
      }
    }
  }

  post {
    always {
      script {
        if (isUnix()) {
          sh 'docker logout || true'
        } else {
          bat 'docker logout'
        }
      }
    }
    success { echo '✅ Pipeline hoàn thành thành công!' }
    failure { echo '❌ Pipeline thất bại. Kiểm tra Console Output để biết thêm chi tiết.' }
  }
}
