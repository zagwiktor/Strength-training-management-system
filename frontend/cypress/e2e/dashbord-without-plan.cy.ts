describe('Dashboard Page - Redirect to Training Plan Creator', () => {
    beforeEach(() => {
      cy.login('testuser@example.com', 'Password@123');
    });
  
    it('should redirect to training plan creator if no training plans exist', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/training-plan-creator');
      cy.contains('To create a training plan, you first need to add training units and include exercise to them').should('be.visible'); 
    });
});