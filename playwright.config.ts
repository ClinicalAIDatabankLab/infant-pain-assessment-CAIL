import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e',
  timeout:45_000,
  use:{baseURL:'http://localhost:5173',trace:'retain-on-failure'},
  webServer:[
    {command:'npm run dev:api',url:'http://127.0.0.1:3000/api/scales',reuseExistingServer:true,timeout:120_000},
    {command:'npm run dev:web',url:'http://127.0.0.1:5173',reuseExistingServer:true,timeout:120_000},
  ],
});
