import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthorizationController', () => {
    let app: INestApplication;
    let dataSource: DataSource;
  
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
  
      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
      dataSource = moduleFixture.get(DataSource);
      await app.init();
    });
  
    afterAll(async () => {
      await dataSource.destroy();
      await app.close();
    });
  
    beforeEach(async () => {
      const entities = dataSource.entityMetadatas;
      for (const entity of entities) {
        const repository = dataSource.getRepository(entity.name);
        await repository.query(`TRUNCATE "${entity.tableName}" RESTART IDENTITY CASCADE;`);
      }
    
      const userRepo = dataSource.getRepository(User);
      const hashedPassword = await bcrypt.hash('StrongP@ssw0rd123', 10);
      const user = userRepo.create({
        name: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        gender: 'Male',
        weight: 80,
        height: 180,
      });
      const savedUser = await userRepo.save(user);
    });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
        const uniqueEmail = `john.doe+${Date.now()}@example.com`;
        const registerDto = {
          name: 'John',
          surname: 'Doe',
          email: uniqueEmail,
          password: 'StrongP@ssw0rd123',
          gender: 'Male',
          weight: 80,
          height: 180,
        };
      
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto)
          .expect(200);
      
        expect(response.body).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            name: registerDto.name,
            surname: registerDto.surname,
            email: registerDto.email,
            gender: registerDto.gender,
            weight: registerDto.weight,
            height: registerDto.height,
          }),
        );
      
        const userRepo = dataSource.getRepository(User);
        const savedUser = await userRepo.findOneBy({ email: registerDto.email });
        expect(savedUser).toBeDefined();
    });

    it('should return 400 for invalid registration data', async () => {
      const invalidRegisterDto = {
        name: 'J',
        surname: 'D',
        email: 'not-an-email',
        password: 'weak',
        gender: 'Unknown',
        weight: -5,
        height: -10,
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidRegisterDto)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should log in a user and set cookies', async () => {
        const userRepo = dataSource.getRepository(User);
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash('StrongP@ssw0rd123', salt);
    
        const user = userRepo.create({
            name: 'John',
            surname: 'Doe',
            email: 'john.doe@example.com',
            password: hashedPassword,
            gender: 'Male',
            weight: 80,
            height: 180,
        });
        await userRepo.save(user);
    
        const loginDto = {
            email: 'john.doe@example.com',
            password: 'StrongP@ssw0rd123',
        };
    
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send(loginDto)
            .expect(200);
    
        expect(response.body).toEqual({ message: 'Logged in successfully' });
        expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear cookies on logout', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(200);
        
      expect(response.body).toEqual({ message: 'Logged out successfully' });
        
      const cookies = response.headers['set-cookie'];
        
      expect(cookies).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^jwt=;.*Max-Age=0/),
          expect.stringMatching(/^userId=;.*Max-Age=0/),
        ]),
      );
    });
  });
});
