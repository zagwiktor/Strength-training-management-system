describe('Training Plan Creator', () => {
    beforeEach(() => {
      cy.intercept('GET', '/exercise/get', {
        statusCode: 200,
        body: [
          { id: 1, name: 'Push-up', categories: [{ id: 1, name: 'Bodyweight' }] },
          { id: 2, name: 'Squat', categories: [{ id: 1, name: 'Bodyweight' }] },
        ],
      }).as('getExercises');
  
      cy.intercept('GET', '/exercise-category/get', {
        statusCode: 200,
        body: [{ id: 1, name: 'Bodyweight' }],
      }).as('getCategories');
  
      cy.visit('/training-plan-creator'); 
      cy.wait(['@getExercises', '@getCategories']); 
    });
  
    it('should display the form for adding training units', () => {
      cy.contains('To create a training plan, you first need to add training units and include exercise to them').should('be.visible');
      cy.get('#training-unit-name').should('exist');
      cy.get('button').contains('Add').should('be.visible');
    });

    it('should add a new training unit and display exercise fields', () => {
        cy.get('#training-unit-name').type('Strength Training Unit');
        cy.get('button').contains('Add').click();
        cy.contains('1. Strength Training Unit').should('be.visible');
        cy.contains('No exercises added to this unit.').should('be.visible');
        cy.contains('Your exercises').should('be.visible');
    });
});
  