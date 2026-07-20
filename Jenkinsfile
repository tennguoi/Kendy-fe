pipeline {
  agent any

  environment {
    REGISTRY = credentials('kendy-registry-url')
    REGISTRY_CREDENTIALS = 'kendy-registry-credentials'
    IMAGE_NAME = 'kendy/frontend'
    DEPLOY_HOSTS = credentials('kendy-deploy-hosts')
    VITE_API_BASE_URL = credentials('kendy-vite-api-base-url')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.IMAGE_TAG = sh(script: 'git rev-parse --short=12 HEAD', returnStdout: true).trim()
          env.FRONTEND_IMAGE = "${env.REGISTRY}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
        }
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Build Image') {
      steps {
        sh 'docker build -f Dockerfile.prod --build-arg VITE_API_BASE_URL="$VITE_API_BASE_URL" -t "$FRONTEND_IMAGE" .'
      }
    }

    stage('Scan Image') {
      steps {
        sh 'trivy image --exit-code 1 --severity HIGH,CRITICAL "$FRONTEND_IMAGE"'
      }
    }

    stage('Push Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: env.REGISTRY_CREDENTIALS, usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_PASSWORD')]) {
          sh 'echo "$REGISTRY_PASSWORD" | docker login "$REGISTRY" -u "$REGISTRY_USER" --password-stdin'
          sh 'docker push "$FRONTEND_IMAGE"'
        }
      }
    }

    stage('Deploy') {
      when {
        branch 'main'
      }
      steps {
        sshagent(credentials: ['kendy-deploy-ssh-key']) {
          sh '''
            for host in $DEPLOY_HOSTS; do
              ssh -o StrictHostKeyChecking=no "$host" "FRONTEND_IMAGE='$FRONTEND_IMAGE' APP_DIR=/opt/kendy /opt/kendy/deploy.sh"
            done
          '''
        }
      }
    }
  }
}
