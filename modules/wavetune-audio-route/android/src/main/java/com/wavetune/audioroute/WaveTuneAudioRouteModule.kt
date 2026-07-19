package com.wavetune.audioroute

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.database.ContentObserver
import android.media.MediaScannerConnection
import android.media.MediaRouter
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.Process
import android.provider.MediaStore
import android.util.Log
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import org.jaudiotagger.audio.AudioFileIO
import org.jaudiotagger.tag.FieldKey
import org.jaudiotagger.tag.Tag

@Suppress("DEPRECATION")
class WaveTuneAudioRouteModule : Module() {
  private data class AudioMediaItem(
    val filePath: String?,
    val mimeType: String?,
    val uri: Uri
  )

  private data class PendingMetadataUpdate(
    val assetId: String,
    val metadata: Map<String, String?>,
    val promise: Promise
  )

  companion object {
    private const val METADATA_WRITE_REQUEST_CODE = 9128
  }

  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()
  private val mediaRouter: MediaRouter
    get() = context.getSystemService(Context.MEDIA_ROUTER_SERVICE) as MediaRouter
  private val mainHandler = Handler(Looper.getMainLooper())
  private val routesById = mutableMapOf<String, MediaRouter.RouteInfo>()
  private var audioObserverRegistered = false
  private var pendingMetadataUpdate: PendingMetadataUpdate? = null
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
        pendingMetadataUpdate?.promise?.resolve(false)
        pendingMetadataUpdate = null
        unregisterRouteCallback()
        unregisterAudioObserver()
      }
    }

    OnActivityResult { _, payload ->
      if (payload.requestCode != METADATA_WRITE_REQUEST_CODE) {
        return@OnActivityResult
      }

      val pendingUpdate = pendingMetadataUpdate ?: return@OnActivityResult
      pendingMetadataUpdate = null

      if (payload.resultCode == Activity.RESULT_OK) {
        writeAudioMetadataAsync(pendingUpdate)
      } else {
        pendingUpdate.promise.resolve(false)
      }
    }

    AsyncFunction("getAudioRoutes") {
      registerRouteCallback()
      createRoutes()
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("getAudioMetadata") { assetIds: List<String> ->
      getAudioMetadata(assetIds)
    }

    AsyncFunction("updateAudioMetadata") { assetId: String, metadata: Map<String, String?>, promise: Promise ->
      val mediaItem = getAudioMediaItem(assetId)

      if (mediaItem == null) {
        promise.resolve(false)
      } else if (hasWriteAccess(mediaItem.uri)) {
        writeAudioMetadataAsync(PendingMetadataUpdate(assetId, metadata, promise))
      } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && pendingMetadataUpdate == null) {
        pendingMetadataUpdate = PendingMetadataUpdate(assetId, metadata, promise)

        try {
          requestMetadataWriteAccess(mediaItem.uri)
        } catch (_: Exception) {
          pendingMetadataUpdate = null
          promise.resolve(false)
        }
      } else {
        promise.resolve(false)
      }
    }.runOnQueue(Queues.MAIN)

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

  private fun hasWriteAccess(uri: Uri): Boolean {
    return context.checkUriPermission(
      uri,
      Process.myPid(),
      Process.myUid(),
      Intent.FLAG_GRANT_WRITE_URI_PERMISSION
    ) == PackageManager.PERMISSION_GRANTED
  }

  private fun requestMetadataWriteAccess(uri: Uri) {
    val activity = appContext.currentActivity
      ?: throw IllegalStateException("Unable to request permission without an active activity.")
    val writeRequest = MediaStore.createWriteRequest(context.contentResolver, listOf(uri))

    activity.startIntentSenderForResult(
      writeRequest.intentSender,
      METADATA_WRITE_REQUEST_CODE,
      null,
      0,
      0,
      0
    )
  }

  private fun writeAudioMetadataAsync(pendingUpdate: PendingMetadataUpdate) {
    Thread {
      pendingUpdate.promise.resolve(
        writeAudioMetadataToFile(pendingUpdate.assetId, pendingUpdate.metadata)
      )
    }.start()
  }

  private fun writeAudioMetadataToFile(assetId: String, metadata: Map<String, String?>): Boolean {
    val mediaItem = getAudioMediaItem(assetId) ?: return false
    val temporaryFile = File.createTempFile(
      "wavetune-metadata-",
      getTemporaryFileSuffix(mediaItem.mimeType),
      context.cacheDir
    )

    return try {
      val sourceCopied = context.contentResolver.openInputStream(mediaItem.uri)?.use { input ->
        FileOutputStream(temporaryFile).use { output -> input.copyTo(output) }
        true
      } ?: false
      if (!sourceCopied) return false

      val audioFile = AudioFileIO.read(temporaryFile)
      val tag = audioFile.tagOrCreateAndSetDefault
      updateTagField(tag, FieldKey.TITLE, metadata["title"])
      updateTagField(tag, FieldKey.ARTIST, metadata["artist"])
      updateTagField(tag, FieldKey.ALBUM, metadata["albumTitle"])
      updateTagField(tag, FieldKey.GENRE, metadata["genre"])
      AudioFileIO.write(audioFile)

      val destinationWritten = context.contentResolver.openOutputStream(mediaItem.uri, "wt")?.use { output ->
        FileInputStream(temporaryFile).use { input -> input.copyTo(output) }
        true
      } ?: false
      if (!destinationWritten) return false

      mediaItem.filePath?.let { filePath ->
        MediaScannerConnection.scanFile(context, arrayOf(filePath), arrayOf(mediaItem.mimeType), null)
      }
      true
    } catch (exception: Exception) {
      Log.e("WaveTuneAudioRoute", "Unable to write audio metadata.", exception)
      false
    } finally {
      temporaryFile.delete()
    }
  }

  private fun updateTagField(tag: Tag, field: FieldKey, value: String?) {
    if (value == null) {
      tag.deleteField(field)
    } else {
      tag.setField(field, value)
    }
  }

  private fun getTemporaryFileSuffix(mimeType: String?): String {
    return when (mimeType) {
      "audio/mpeg" -> ".mp3"
      "audio/mp4" -> ".m4a"
      else -> ".audio"
    }
  }

  private fun getAudioMediaItem(assetId: String): AudioMediaItem? {
    val projection = arrayOf(
      MediaStore.MediaColumns.DATA,
      MediaStore.MediaColumns.MIME_TYPE,
      MediaStore.MediaColumns.VOLUME_NAME
    )
    val cursor = context.contentResolver.query(
      MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
      projection,
      "${MediaStore.Audio.Media._ID} = ?",
      arrayOf(assetId),
      null
    ) ?: return null

    cursor.use {
      if (!it.moveToFirst()) return null

      val volumeName = it.getNullableString(
        it.getColumnIndex(MediaStore.MediaColumns.VOLUME_NAME)
      )
      val collectionUri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        volumeName?.let(MediaStore.Audio.Media::getContentUri)
      } else {
        null
      } ?: MediaStore.Audio.Media.EXTERNAL_CONTENT_URI

      return AudioMediaItem(
        filePath = it.getNullableString(it.getColumnIndex(MediaStore.MediaColumns.DATA)),
        mimeType = it.getNullableString(it.getColumnIndex(MediaStore.MediaColumns.MIME_TYPE)),
        uri = Uri.withAppendedPath(collectionUri, assetId)
      )
    }
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
