package com.wavetune.audioroute

import android.content.Context
import android.database.ContentObserver
import android.media.MediaRouter
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

@Suppress("DEPRECATION")
class WaveTuneAudioRouteModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()
  private val mediaRouter: MediaRouter
    get() = context.getSystemService(Context.MEDIA_ROUTER_SERVICE) as MediaRouter
  private val mainHandler = Handler(Looper.getMainLooper())
  private val routesById = mutableMapOf<String, MediaRouter.RouteInfo>()
  private var audioObserverRegistered = false
  private var routeCallbackRegistered = false

  private val audioObserver = object : ContentObserver(mainHandler) {
    override fun onChange(selfChange: Boolean) {
      sendEvent("audioLibraryChanged")
    }
  }

  private val routeCallback = object : MediaRouter.SimpleCallback() {
    override fun onRouteAdded(router: MediaRouter, route: MediaRouter.RouteInfo) = emitRoutes()
    override fun onRouteRemoved(router: MediaRouter, route: MediaRouter.RouteInfo) = emitRoutes()
    override fun onRouteChanged(router: MediaRouter, route: MediaRouter.RouteInfo) = emitRoutes()

    override fun onRouteSelected(
      router: MediaRouter,
      type: Int,
      route: MediaRouter.RouteInfo
    ) = emitRoutes()

    override fun onRouteUnselected(
      router: MediaRouter,
      type: Int,
      route: MediaRouter.RouteInfo
    ) = emitRoutes()
  }

  override fun definition() = ModuleDefinition {
    Name("WaveTuneAudioRoute")
    Events("audioRoutesChanged", "audioLibraryChanged")

    OnStartObserving("audioRoutesChanged") {
      mainHandler.post { registerRouteCallback() }
    }
    OnStopObserving("audioRoutesChanged") {
      mainHandler.post { unregisterRouteCallback() }
    }

    OnStartObserving("audioLibraryChanged") {
      mainHandler.post { registerAudioObserver() }
    }
    OnStopObserving("audioLibraryChanged") {
      mainHandler.post { unregisterAudioObserver() }
    }

    OnDestroy {
      mainHandler.post {
        unregisterRouteCallback()
        unregisterAudioObserver()
      }
    }

    AsyncFunction("getAudioRoutes") {
      registerRouteCallback()
      createRoutes()
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("getAudioMetadata") { assetIds: List<String> ->
      getAudioMetadata(assetIds)
    }

    AsyncFunction("selectAudioRoute") { routeId: String ->
      createRoutes()
      val route = routesById[routeId]
        ?: throw IllegalStateException("The selected audio output is no longer available.")

      if (!route.isEnabled) {
        throw IllegalStateException("The selected audio output is no longer available.")
      }

      mediaRouter.selectRoute(MediaRouter.ROUTE_TYPE_LIVE_AUDIO, route)
      emitRoutes()
      true
    }.runOnQueue(Queues.MAIN)
  }

  private fun registerRouteCallback() {
    if (routeCallbackRegistered) return

    mediaRouter.addCallback(
      MediaRouter.ROUTE_TYPE_LIVE_AUDIO,
      routeCallback,
      MediaRouter.CALLBACK_FLAG_PERFORM_ACTIVE_SCAN
    )
    routeCallbackRegistered = true
  }

  private fun unregisterRouteCallback() {
    if (!routeCallbackRegistered) return
    mediaRouter.removeCallback(routeCallback)
    routeCallbackRegistered = false
    routesById.clear()
  }

  private fun registerAudioObserver() {
    if (audioObserverRegistered) return
    context.contentResolver.registerContentObserver(
      MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
      true,
      audioObserver
    )
    audioObserverRegistered = true
  }

  private fun unregisterAudioObserver() {
    if (!audioObserverRegistered) return
    context.contentResolver.unregisterContentObserver(audioObserver)
    audioObserverRegistered = false
  }

  private fun emitRoutes() {
    sendEvent("audioRoutesChanged", mapOf("routes" to createRoutes()))
  }

  private fun createRoutes(): List<Map<String, Any?>> {
    val selectedRoute = mediaRouter.getSelectedRoute(MediaRouter.ROUTE_TYPE_LIVE_AUDIO)
    val routes = mutableListOf<Map<String, Any?>>()
    routesById.clear()

    for (index in 0 until mediaRouter.routeCount) {
      val route = mediaRouter.getRouteAt(index)
      if (!route.isEnabled || route.supportedTypes and MediaRouter.ROUTE_TYPE_LIVE_AUDIO == 0) {
        continue
      }

      val routeId = "route:${System.identityHashCode(route)}"
      routesById[routeId] = route
      routes.add(
        mapOf(
          "id" to routeId,
          "name" to route.getName(context).toString(),
          "description" to route.description?.toString(),
          "selected" to (route === selectedRoute),
          "type" to getRouteType(route)
        )
      )
    }

    return routes
  }

  private fun getAudioMetadata(assetIds: List<String>): List<Map<String, Any?>> {
    if (assetIds.isEmpty()) return emptyList()

    val metadataById = mutableMapOf<String, Map<String, Any?>>()
    val projection = arrayOf(
      MediaStore.Audio.Media._ID,
      MediaStore.Audio.Media.ALBUM_ID,
      MediaStore.Audio.Media.ALBUM,
      MediaStore.Audio.Media.ARTIST,
      MediaStore.Audio.Media.TITLE
    )

    assetIds.chunked(300).forEach { chunk ->
      val placeholders = chunk.joinToString(",") { "?" }
      val selection = "${MediaStore.Audio.Media._ID} IN ($placeholders)"

      context.contentResolver.query(
        MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
        projection,
        selection,
        chunk.toTypedArray(),
        null
      )?.use { cursor ->
        val idIndex = cursor.getColumnIndex(MediaStore.Audio.Media._ID)
        val albumIdIndex = cursor.getColumnIndex(MediaStore.Audio.Media.ALBUM_ID)
        val albumTitleIndex = cursor.getColumnIndex(MediaStore.Audio.Media.ALBUM)
        val artistIndex = cursor.getColumnIndex(MediaStore.Audio.Media.ARTIST)
        val titleIndex = cursor.getColumnIndex(MediaStore.Audio.Media.TITLE)

        while (cursor.moveToNext()) {
          val id = cursor.getString(idIndex)
          metadataById[id] = mapOf(
            "id" to id,
            "albumId" to cursor.getNullableString(albumIdIndex),
            "albumTitle" to cursor.getNullableString(albumTitleIndex),
            "artist" to cursor.getNullableString(artistIndex),
            "title" to cursor.getNullableString(titleIndex)
          )
        }
      }
    }

    return assetIds.mapNotNull { metadataById[it] }
  }

  private fun getRouteType(route: MediaRouter.RouteInfo): String {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) return "device"

    return when (route.deviceType) {
      MediaRouter.RouteInfo.DEVICE_TYPE_BLUETOOTH -> "bluetooth"
      MediaRouter.RouteInfo.DEVICE_TYPE_SPEAKER -> "speaker"
      MediaRouter.RouteInfo.DEVICE_TYPE_TV -> "tv"
      else -> "device"
    }
  }
}

private fun android.database.Cursor.getNullableString(columnIndex: Int): String? {
  if (columnIndex < 0 || isNull(columnIndex)) return null

  return getString(columnIndex)
}
