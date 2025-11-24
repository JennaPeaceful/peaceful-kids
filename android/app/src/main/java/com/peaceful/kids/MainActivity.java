package com.peaceful.kids;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Configure WebView for media playback
        if (this.bridge != null) {
            WebView webView = this.bridge.getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();

                // Disable text auto-sizing to fix Android font scaling issues
                settings.setTextZoom(100);

                // Enable media playback without user gesture
                settings.setMediaPlaybackRequiresUserGesture(false);

                // Enable JavaScript (should already be enabled, but ensure it)
                settings.setJavaScriptEnabled(true);

                // Allow file access for media
                settings.setAllowFileAccess(true);
                settings.setAllowContentAccess(true);

                // Enable DOM storage (needed for video player)
                settings.setDomStorageEnabled(true);

                // Set mixed content mode to allow HTTPS video on HTTP pages (if needed)
                settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            }
        }
    }
}
