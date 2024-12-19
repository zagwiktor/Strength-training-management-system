import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Diet } from './entities/diet.entity';
import { JwtService } from '@nestjs/jwt';

describe('DietController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let jwtToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

    jwtService = moduleFixture.get(JwtService);
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
    const user = userRepo.create({
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      password: 'hashed-password',
      gender: 'Male',
      weight: 80,
      height: 180,
    });
    const savedUser = await userRepo.save(user);
    userId = savedUser.id;

    const payload = { sub: userId, username: savedUser.email };
    jwtToken = await jwtService.signAsync(payload, { secret: process.env.JWT_SECRET_KEY });
  });

  describe('/diet/create (POST)', () => {
    it('should create a new diet for the user', async () => {
      const createDietDto = {
        calories: 1700,
        protein: 100,
        fat: 100,
        carbohydrates: 100,
      };

      const response = await request(app.getHttpServer())
        .post('/diet/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createDietDto)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          calories: createDietDto.calories,
          protein: createDietDto.protein,
          fat: createDietDto.fat,
          carbohydrates: createDietDto.carbohydrates,
        }),
      );
    });

    it('should return 400 if macronutrients do not match calories', async () => {
      const invalidDietDto = {
        calories: 2000,
        protein: 100,
        fat: 50,
        carbohydrates: 100,
      };

      await request(app.getHttpServer())
        .post('/diet/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidDietDto)
        .expect(400);
    });
  });

  describe('/diet/get (GET)', () => {
    it('should return all diets for the user', async () => {
      const dietRepo = dataSource.getRepository(Diet);
      const userRepo = dataSource.getRepository(User);

      const user = await userRepo.findOne({ where: { id: userId } });
      const diet = dietRepo.create({
        calories: 1700,
        protein: 100,
        fat: 100,
        carbohydrates: 100,
        author: user,
      });
      await dietRepo.save(diet);

      const response = await request(app.getHttpServer())
        .get('/diet/get')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual([
        expect.objectContaining({
          id: diet.id,
          calories: diet.calories,
          protein: diet.protein,
          fat: diet.fat,
          carbohydrates: diet.carbohydrates,
        }),
      ]);
    });
  });

  describe('/diet/get/:id (GET)', () => {
    it('should return a specific diet by ID', async () => {
      const dietRepo = dataSource.getRepository(Diet);
      const userRepo = dataSource.getRepository(User);

      const user = await userRepo.findOne({ where: { id: userId } });
      const diet = dietRepo.create({
        calories: 1700,
        protein: 100,
        fat: 100,
        carbohydrates: 100,
        author: user,
      });
      const savedDiet = await dietRepo.save(diet);

      const response = await request(app.getHttpServer())
        .get(`/diet/get/${savedDiet.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: savedDiet.id,
          calories: savedDiet.calories,
          protein: savedDiet.protein,
          fat: savedDiet.fat,
          carbohydrates: savedDiet.carbohydrates,
        }),
      );
    });

    it('should return 404 if the diet does not exist', async () => {
      await request(app.getHttpServer())
        .get('/diet/get/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });
});
