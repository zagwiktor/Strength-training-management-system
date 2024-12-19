import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Exercise } from './entities/exercise.entity';
import { JwtService } from '@nestjs/jwt';
import { ExerciseCategory } from 'src/exercise-category/entities/exercise-category.entity';

describe('ExerciseController', () => {
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
  
    const categoryRepo = dataSource.getRepository(ExerciseCategory);
    await categoryRepo.save([
      { id: 1, name: 'Strength' },
      { id: 2, name: 'Cardio' },
    ]);
  
    const payload = { sub: userId, username: savedUser.email };
    jwtToken = await jwtService.signAsync(payload, { secret: process.env.JWT_SECRET_KEY });
  });
  

  describe('/exercise/create (POST)', () => {
    it('should create a new exercise', async () => {
      const createExerciseDto = {
        name: 'Squats',
        description: 'A leg exercise',
        sets: 3,
        reps: 12,
        tempo: [3, 1, 1, 1],
        load: 100,
        categories: [1, 2],
      };

      const response = await request(app.getHttpServer())
        .post('/exercise/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createExerciseDto)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: createExerciseDto.name,
          description: createExerciseDto.description,
          sets: createExerciseDto.sets,
          reps: createExerciseDto.reps,
        }),
      );
    });

    it('should return 400 for invalid data', async () => {
      const invalidExerciseDto = {
        name: '',
        sets: 0,
        reps: -1,
        categories: 'not-an-array',
      };

      await request(app.getHttpServer())
        .post('/exercise/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidExerciseDto)
        .expect(400);
    });
  });

  describe('/exercise/get (GET)', () => {
    it('should return all exercises for the user', async () => {
      const exerciseRepo = dataSource.getRepository(Exercise);
      const userRepo = dataSource.getRepository(User);

      const user = await userRepo.findOne({ where: { id: userId } });
      const exercise = exerciseRepo.create({
        name: 'Push Ups',
        description: 'An upper body exercise',
        sets: 4,
        reps: 15,
        author: user,
      });
      await exerciseRepo.save(exercise);

      const response = await request(app.getHttpServer())
        .get('/exercise/get')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: exercise.id,
            name: exercise.name,
            description: exercise.description,
          }),
        ]),
      );
    });
  });

  describe('/exercise/get/:id (GET)', () => {
    it('should return a specific exercise by ID', async () => {
      const exerciseRepo = dataSource.getRepository(Exercise);
      const userRepo = dataSource.getRepository(User);

      const user = await userRepo.findOne({ where: { id: userId } });
      const exercise = exerciseRepo.create({
        name: 'Deadlift',
        sets: 3,
        reps: 8,
        author: user,
      });
      const savedExercise = await exerciseRepo.save(exercise);

      const response = await request(app.getHttpServer())
        .get(`/exercise/get/${savedExercise.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: savedExercise.id,
          name: savedExercise.name,
          sets: savedExercise.sets,
          reps: savedExercise.reps,
        }),
      );
    });

    it('should return 404 if the exercise does not exist', async () => {
      await request(app.getHttpServer())
        .get('/exercise/get/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });

  describe('/exercise/update/:id (PATCH)', () => {
    it('should update an existing exercise', async () => {
      const exerciseRepo = dataSource.getRepository(Exercise);
      const userRepo = dataSource.getRepository(User);

      const user = await userRepo.findOne({ where: { id: userId } });
      const exercise = exerciseRepo.create({
        name: 'Bench Press',
        sets: 3,
        reps: 10,
        author: user,
      });
      const savedExercise = await exerciseRepo.save(exercise);

      const updateExerciseDto = { sets: 4, reps: 12 };

      const response = await request(app.getHttpServer())
        .patch(`/exercise/update/${savedExercise.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateExerciseDto)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: savedExercise.id,
          sets: updateExerciseDto.sets,
          reps: updateExerciseDto.reps,
        }),
      );
    });

    it('should return 404 if the exercise does not exist', async () => {
      const updateExerciseDto = { sets: 4, reps: 12 };

      await request(app.getHttpServer())
        .patch('/exercise/update/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateExerciseDto)
        .expect(404);
    });
  });

  describe('/exercise/delete/:id (DELETE)', () => {
    it('should delete an existing exercise', async () => {
      const exerciseRepo = dataSource.getRepository(Exercise);
      const userRepo = dataSource.getRepository(User);

      const user = await userRepo.findOne({ where: { id: userId } });
      const exercise = exerciseRepo.create({
        name: 'Pull Ups',
        sets: 3,
        reps: 12,
        author: user,
      });
      const savedExercise = await exerciseRepo.save(exercise);

      await request(app.getHttpServer())
        .delete(`/exercise/delete/${savedExercise.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const deletedExercise = await exerciseRepo.findOne({ where: { id: savedExercise.id } });
      expect(deletedExercise).toBeNull();
    });

    it('should return 404 if the exercise does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/exercise/delete/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });
});
