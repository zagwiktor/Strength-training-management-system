import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Exercise } from 'src/exercise/entities/exercise.entity';
import { TrainingUnit } from './entities/training-unit.entity';
import { JwtService } from '@nestjs/jwt';

describe('TrainingUnitController', () => {
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

  describe('/training-units/create (POST)', () => {
    it('should create a new training unit', async () => {
      const exerciseRepo = dataSource.getRepository(Exercise);
      const exercise = exerciseRepo.create({ name: 'Push Ups', sets: 3, reps: 12, author: { id: userId } });
      const savedExercise = await exerciseRepo.save(exercise);
      const createTrainingUnitDto = {
        name: 'Unit A',
        description: 'Sample training unit',
        exercises: [savedExercise.id],
      };

      const response = await request(app.getHttpServer())
        .post('/training-units/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createTrainingUnitDto)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: createTrainingUnitDto.name,
          description: createTrainingUnitDto.description,
          orderedExercises: expect.any(Array),
        }),
      );
    });

    it('should return 400 for invalid data', async () => {
      const invalidTrainingUnitDto = {
        name: '',
        exercises: ['invalid-id'],
      };

      await request(app.getHttpServer())
        .post('/training-units/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidTrainingUnitDto)
        .expect(400);
    });
  });

  describe('/training-units/get (GET)', () => {
    it('should return all training units for the user', async () => {
      const trainingUnitRepo = dataSource.getRepository(TrainingUnit);

      const trainingUnit = trainingUnitRepo.create({
        name: 'Unit A',
        description: 'Sample unit',
        author: { id: userId },
        exercises: [],
        orderedExercises: [],
      });
      await trainingUnitRepo.save(trainingUnit);

      const response = await request(app.getHttpServer())
        .get('/training-units/get')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: trainingUnit.id,
            name: trainingUnit.name,
            description: trainingUnit.description,
          }),
        ]),
      );
    });
  });

  describe('/training-units/get/:id (GET)', () => {
    it('should return a specific training unit by ID', async () => {
      const trainingUnitRepo = dataSource.getRepository(TrainingUnit);

      const trainingUnit = trainingUnitRepo.create({
        name: 'Unit A',
        description: 'Sample unit',
        author: { id: userId },
        exercises: [],
        orderedExercises: [],
      });
      const savedTrainingUnit = await trainingUnitRepo.save(trainingUnit);

      const response = await request(app.getHttpServer())
        .get(`/training-units/get/${savedTrainingUnit.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: savedTrainingUnit.id,
          name: savedTrainingUnit.name,
          description: savedTrainingUnit.description,
        }),
      );
    });

    it('should return 404 if the training unit does not exist', async () => {
      await request(app.getHttpServer())
        .get('/training-units/get/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });

  describe('/training-units/update/:id (PATCH)', () => {
    it('should update an existing training unit', async () => {
      const trainingUnitRepo = dataSource.getRepository(TrainingUnit);

      const trainingUnit = trainingUnitRepo.create({
        name: 'Unit A',
        description: 'Sample unit',
        author: { id: userId },
        exercises: [],
        orderedExercises: [],
      });
      const savedTrainingUnit = await trainingUnitRepo.save(trainingUnit);

      const updateTrainingUnitDto = { name: 'Updated Unit' };

      const response = await request(app.getHttpServer())
        .patch(`/training-units/update/${savedTrainingUnit.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateTrainingUnitDto)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: savedTrainingUnit.id,
          name: updateTrainingUnitDto.name,
        }),
      );
    });

    it('should return 404 if the training unit does not exist', async () => {
      const updateTrainingUnitDto = { name: 'Updated Unit' };

      await request(app.getHttpServer())
        .patch('/training-units/update/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateTrainingUnitDto)
        .expect(404);
    });
  });

  describe('/training-units/delete/:id (DELETE)', () => {
    it('should delete an existing training unit', async () => {
      const trainingUnitRepo = dataSource.getRepository(TrainingUnit);

      const trainingUnit = trainingUnitRepo.create({
        name: 'Unit A',
        description: 'Sample unit',
        author: { id: userId },
        exercises: [],
        orderedExercises: [],
      });
      const savedTrainingUnit = await trainingUnitRepo.save(trainingUnit);

      await request(app.getHttpServer())
        .delete(`/training-units/delete/${savedTrainingUnit.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const deletedUnit = await trainingUnitRepo.findOne({ where: { id: savedTrainingUnit.id } });
      expect(deletedUnit).toBeNull();
    });

    it('should return 404 if the training unit does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/training-units/delete/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });
});
