import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: '/Official_KeyClub_Directory/',

    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                memberFee: resolve(__dirname, 'memberFee.html'),
                attendance: resolve(__dirname, 'attendance.html')
            }
        }
    }
});