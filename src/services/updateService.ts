export class UpdateService {
  static async checkForUpdates() {
    try {
      if (!__DEV__) {
        const Updates = await import('expo-updates');
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      }
    } catch (error) {
      console.log('Updates not available in development');
    }
  }


}