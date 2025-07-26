pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        PRODUCTION_PROFILE = 'production'
        APP_SERVICE = 'app-prod'
        FRONT_ENV = credentials('vela-front-end-env')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Stop Existing Containers') {
            steps {
                script {
                    echo 'Stopping existing production containers...'
                    sh '''
                        # Stop and remove existing containers with production profile
                        docker-compose down || true
                        
                        # Remove any dangling containers
                        docker container prune -f || true
                    '''
                }
            }
        }
        
        stage('Clean Docker Images') {
            steps {
                script {
                    echo 'Cleaning old Docker images...'
                    sh '''
                        # Remove old images to free up space
                        docker image prune -f || true
                        
                        # Remove any dangling images
                        docker system prune -f || true
                    '''
                }
            }
        }

        stage('Write .env file') {
            steps {
                sh '''
                echo "$FRONT_ENV" > .env
                '''
            }
        }

        stage('Build Production Image') {
            steps {
                script {
                    echo 'Building new production Docker image...'
                    sh '''
                        # Build the production image
                        docker-compose --profile ${PRODUCTION_PROFILE} build ${APP_SERVICE}
                        
                        # Verify the image was built successfully
                        docker images | grep front_note || exit 1
                    '''
                }
            }
        }
        
        stage('Start Production Containers') {
            steps {
                script {
                    echo 'Starting production containers...'
                    sh '''
                        # Start the production service
                        docker-compose --profile ${PRODUCTION_PROFILE} up -d ${APP_SERVICE}
                        
                        # Wait a moment for the container to start
                        sleep 10
                        
                        # Check if the container is running
                        docker-compose --profile ${PRODUCTION_PROFILE} ps
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo 'Performing health check...'
                    sh '''
                        # Wait for the application to be ready
                        timeout 60 bash -c 'until curl -f http://localhost:3000 > /dev/null 2>&1; do sleep 2; done' || {
                            echo "Health check failed - application not responding on port 3000"
                            docker-compose --profile ${PRODUCTION_PROFILE} logs ${APP_SERVICE}
                            exit 1
                        }
                        
                        echo "Health check passed - application is running successfully"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo 'Cleaning up workspace...'
                sh '''
                    # Clean up workspace files
                    rm -rf node_modules .next || true
                '''
            }
        }
        
        success {
            echo 'Production deployment completed successfully!'
        }
        
        failure {
            script {
                echo 'Production deployment failed!'
                sh '''
                    # Show logs for debugging
                    docker-compose --profile ${PRODUCTION_PROFILE} logs ${APP_SERVICE} || true
                    
                    # Show container status
                    docker-compose --profile ${PRODUCTION_PROFILE} ps || true
                '''
            }
        }
        
        cleanup {
            script {
                echo 'Cleaning up Docker resources...'
                sh '''
                    # Clean up any stopped containers
                    docker container prune -f || true
                    
                    # Clean up unused images
                    docker image prune -f || true
                '''
            }
        }
    }
} 