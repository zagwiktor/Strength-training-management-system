import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { ExerciseCategory } from './entities/exercise-category.entity';
import { JwtService } from '@nestjs/jwt';

describe('ExerciseCategoryController', () => {
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

  describe('/exercise-category/create (POST)', () => {
    it('should create a new exercise category', async () => {
      const createExerciseCategoryDto = {
        name: 'Strength',
      };

      const response = await request(app.getHttpServer())
        .post('/exercise-category/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createExerciseCategoryDto)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: createExerciseCategoryDto.name,
        }),
      );
    });

    it('should return 400 for invalid data', async () => {
      const invalidExerciseCategoryDto = {
        name: 'A', // Name too short
      };

      await request(app.getHttpServer())
        .post('/exercise-category/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidExerciseCategoryDto)
        .expect(400);
    });
  });

  describe('/exercise-category/get (GET)', () => {
    it('should return all exercise categories for the user', async () => {
      const categoryRepo = dataSource.getRepository(ExerciseCategory);
      const userRepo = dataSource.getRepository(User);

      const user = await userRepo.findOne({ where: { id: userId } });
      const category = categoryRepo.create({
        name: 'Strength',
        author: user,
      });
      await categoryRepo.save(category);

      const response = await request(app.getHttpServer())
        .get('/exercise-category/get')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: category.id,
            name: category.name,
          }),
        ]),
      );
    });
  });

  describe('/exercise-category/get/:id (GET)', () => {
    it('should return a specific exercise category by ID', async () => {
      const categoryRepo = dataSource.getRepository(ExerciseCategory);
      const userRepo = dataSource.getRepository(User);

      const user = await userRepo.findOne({ where: { id: userId } });
      const category = categoryRepo.create({
        name: 'Cardio',
        author: user,
      });
      const savedCategory = await categoryRepo.save(category);

      const response = await request(app.getHttpServer())
        .get(`/exercise-category/get/${savedCategory.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: savedCategory.id,
          name: savedCategory.name,
        }),
      );
    });

    it('should return 404 if the exercise category does not exist', async () => {
      await request(app.getHttpServer())
        .get('/exercise-category/get/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });

  describe('/exercise-category/update/:id (PATCH)', () => {
    it('should update an existing exercise category', async () => {
      const categoryRepo = dataSource.getRepository(ExerciseCategory);
      const userRepo = dataSource.getRepository(User);

      const user = await userRepo.findOne({ where: { id: userId } });
      const category = categoryRepo.create({
        name: 'Exercise',
        author: user,
      });
      const savedCategory = await categoryRepo.save(category);

      const updateExerciseCategoryDto = { name: 'Updated EX' };

      const response = await request(app.getHttpServer())
        .patch(`/exercise-category/update/${savedCategory.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateExerciseCategoryDto)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: savedCategory.id,
          name: updateExerciseCategoryDto.name,
        }),
      );
    });

    it('should return 404 if the exercise category does not exist', async () => {
      const updateExerciseCategoryDto = { name: 'Nonexistent' };

      await request(app.getHttpServer())
        .patch('/exercise-category/update/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateExerciseCategoryDto)
        .expect(404);
    });
  });

  describe('/exercise-category/delete/:id (DELETE)', () => {
    it('should delete an existing exercise category', async () => {
      const categoryRepo = dataSource.getRepository(ExerciseCategory);
      const userRepo = dataSource.getRepository(User);

      const user = await userRepo.findOne({ where: { id: userId } });
      const category = categoryRepo.create({
        name: 'Flexibility',
        author: user,
      });
      const savedCategory = await categoryRepo.save(category);

      await request(app.getHttpServer())
        .delete(`/exercise-category/delete/${savedCategory.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const deletedCategory = await categoryRepo.findOne({ where: { id: savedCategory.id } });
      expect(deletedCategory).toBeNull();
    });

    it('should return 404 if the exercise category does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/exercise-category/delete/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });
});
