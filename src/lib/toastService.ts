// Simple toast service for notifications
export const toastService = {
  success(message: string) {
    console.log('✅', message);
    // In a real implementation, this would show a toast notification
  },
  
  error(message: string) {
    console.error('❌', message);
    // In a real implementation, this would show an error toast
  },
  
  info(message: string) {
    console.info('ℹ️', message);
    // In a real implementation, this would show an info toast
  }
};