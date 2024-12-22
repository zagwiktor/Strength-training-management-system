describe('Registration and Login Flow', () => {
  let uniqueEmail: string;

  before(() => {
    const timestamp = new Date().getTime();
    uniqueEmail = `testuser+${timestamp}@example.com`;
  });

  describe('Registration Page', () => {
    beforeEach(() => {
      cy.visit('/register');
    });

    it('should successfully register a new user', () => {
      cy.get('#register-form-name-input').type('John');
      cy.get('#register-form-surname-input').type('Doe');
      cy.get('#register-form-email-input').type(uniqueEmail);
      cy.get('#register-form-password-input').type('Password@123');
      cy.get('#register-form-weight-input').type('80');
      cy.get('#register-form-height-input').type('180');
      cy.get('#register-form-gender-input').click();
      cy.contains('li', 'Male').click();
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/login'); 
    });

    it('should display error message if email already exists', () => {
      cy.get('#register-form-name-input').type('John');
      cy.get('#register-form-surname-input').type('Doe');
      cy.get('#register-form-email-input').type(uniqueEmail); 
      cy.get('#register-form-password-input').type('Password@123');
      cy.get('#register-form-weight-input').type('80');
      cy.get('#register-form-height-input').type('180');
      cy.get('#register-form-gender-input').click();
      cy.contains('li', 'Male').click();
      cy.get('button[type="submit"]').click();
      cy.contains('Email already exists').should('be.visible');
    });
  });

  describe('Login Page', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should successfully log in with registered user', () => {
      cy.get('#login-form-name-input').type(uniqueEmail); 
      cy.get('#login-form-username-input').type('Password@123'); 
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard'); 
    });

    it('should display error message for invalid credentials', () => {
      cy.get('#login-form-name-input').type(uniqueEmail); 
      cy.get('#login-form-username-input').type('WrongPassword'); 
      cy.get('button[type="submit"]').click();
      cy.contains('Invalid credentials!').should('be.visible');
    });
  });
});
