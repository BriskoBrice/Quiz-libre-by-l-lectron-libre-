package fr.electronlibre.quizlibre

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat

object NearbyPermissionPolicy {
    fun requiredRuntimePermissions(sdkInt: Int): Array<String> = when {
        sdkInt <= 28 -> arrayOf(Manifest.permission.ACCESS_COARSE_LOCATION)
        sdkInt <= 30 -> arrayOf(Manifest.permission.ACCESS_FINE_LOCATION)
        sdkInt == 31 -> arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.BLUETOOTH_ADVERTISE,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN,
        )
        else -> arrayOf(
            Manifest.permission.BLUETOOTH_ADVERTISE,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.NEARBY_WIFI_DEVICES,
        )
    }

    fun hasAll(context: Context): Boolean = requiredRuntimePermissions(android.os.Build.VERSION.SDK_INT)
        .all { ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED }
}
