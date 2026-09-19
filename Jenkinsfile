pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                bat 'docker build -t duality-ai-backend ./backend'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                bat 'docker build -t duality-ai-frontend ./frontend'
            }
        }

    }
}