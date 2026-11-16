// CafeSoft_ReactNative/Jenkinsfile
pipeline {
    agent { docker { image 'node:20-alpine' } }

    stages {

        stage('Instalar dependencias') {
            steps { sh 'npm ci' }
        }

        stage('Tests Jest') {
            steps {
                sh 'npm test -- --coverage --coverageReporters=lcov'
            }
        }

        stage('Quality Gate – SonarCloud') {
            steps {
                withSonarQubeEnv('SonarCloud') {
                    sh '''npx sonar-scanner \
                        -Dsonar.projectKey=alanronaldosc-dev_CafeSoft_ReactNative \
                        -Dsonar.organization=alanronaldosc-dev \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info'''
                }
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build APK – Staging') {
            when { branch 'master' }
            steps {
                // EAS Build en la nube para no requerir Android Studio en Jenkins
                sh 'npx eas build --profile preview --platform android --non-interactive'
            }
        }

        stage('Aprobación para Producción') {
            when { branch 'master' }
            steps {
                input message: '¿Publicar APK a Producción?',
                      ok: 'Sí, publicar'
            }
        }

        stage('Build APK – Producción') {
            when { branch 'master' }
            steps {
                sh 'npx eas build --profile production --platform android --non-interactive'
                sh 'npx eas submit --platform android --non-interactive'
            }
        }
    }
}
