import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001', 
    specPattern: 'cypress/e2e/**/*.cy.{js,ts,jsx,tsx}', 
    supportFile: 'cypress/support/e2e.ts', 
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});