plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "fr.electronlibre.quizlibre"
    compileSdk = 36

    defaultConfig {
        applicationId = "fr.electronlibre.quizlibre"
        minSdk = 24
        targetSdk = 36
        versionCode = 5
        versionName = "1.3.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-splashscreen:1.2.0")
    implementation("androidx.webkit:webkit:1.16.0")
    implementation("com.google.android.gms:play-services-nearby:19.5.0")
    testImplementation(kotlin("test"))
    testImplementation("org.json:json:20250517")
}
