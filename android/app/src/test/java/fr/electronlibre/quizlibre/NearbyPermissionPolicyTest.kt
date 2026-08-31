package fr.electronlibre.quizlibre

import android.Manifest
import kotlin.test.Test
import kotlin.test.assertContentEquals

class NearbyPermissionPolicyTest {
    @Test
    fun api28UsesCoarseLocation() {
        assertContentEquals(
            arrayOf(Manifest.permission.ACCESS_COARSE_LOCATION),
            NearbyPermissionPolicy.requiredRuntimePermissions(28),
        )
    }

    @Test
    fun api30UsesFineLocation() {
        assertContentEquals(
            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
            NearbyPermissionPolicy.requiredRuntimePermissions(30),
        )
    }

    @Test
    fun api31UsesFineAndBluetoothRuntimePermissions() {
        assertContentEquals(
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.BLUETOOTH_ADVERTISE,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH_SCAN,
            ),
            NearbyPermissionPolicy.requiredRuntimePermissions(31),
        )
    }

    @Test
    fun api36UsesBluetoothAndNearbyWifi() {
        assertContentEquals(
            arrayOf(
                Manifest.permission.BLUETOOTH_ADVERTISE,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.NEARBY_WIFI_DEVICES,
            ),
            NearbyPermissionPolicy.requiredRuntimePermissions(36),
        )
    }
}
