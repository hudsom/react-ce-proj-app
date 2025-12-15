const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withFirebaseManifestFix(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    
    const application = androidManifest.manifest.application[0];
    
    if (application['meta-data']) {
      application['meta-data'] = application['meta-data'].filter(
        (metaData) => 
          metaData.$['android:name'] !== 'com.google.firebase.messaging.default_notification_color'
      );
    } else {
      application['meta-data'] = [];
    }
    
    application['meta-data'].push({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_color',
        'android:resource': '@color/notification_icon_color',
        'tools:replace': 'android:resource'
      }
    });
    
    if (!androidManifest.manifest.$['xmlns:tools']) {
      androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }
    
    return config;
  });
};