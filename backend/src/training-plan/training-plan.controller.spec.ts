import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { TrainingPlan } from './entities/training-plan.entity';
import { JwtService } from '@nestjs/jwt';

describe('TrainingPlanController', () => {
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

  describe('/training-plan/create (POST)', () => {
    it('should create a new training plan', async () => {
      const createTrainingPlanDto = {
        name: 'Plan A',
        description: 'Sample training plan description',
        trainingUnitsIds: [],
        mainPlan: true,
      };

      const response = await request(app.getHttpServer())
        .post('/training-plan/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createTrainingPlanDto)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: createTrainingPlanDto.name,
          description: createTrainingPlanDto.description,
          mainPlan: createTrainingPlanDto.mainPlan,
        }),
      );
    });

    it('should return 400 for invalid data', async () => {
      const invalidTrainingPlanDto = {
        name: '',
        mainPlan: 'not-boolean',
      };

      await request(app.getHttpServer())
        .post('/training-plan/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidTrainingPlanDto)
        .expect(400);
    });
  });

  describe('/training-plan/get (GET)', () => {
    it('should return all training plans for the user', async () => {
      const trainingPlanRepo = dataSource.getRepository(TrainingPlan);

      const trainingPlan = trainingPlanRepo.create({
        name: 'Plan A',
        description: 'Sample training plan description',
        author: { id: userId },
        mainPlan: true,
      });
      await trainingPlanRepo.save(trainingPlan);

      const response = await request(app.getHttpServer())
        .get('/training-plan/get')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: trainingPlan.id,
            name: trainingPlan.name,
            description: trainingPlan.description,
            mainPlan: trainingPlan.mainPlan,
          }),
        ]),
      );
    });
  });

  describe('/training-plan/get/:id (GET)', () => {
    it('should return a specific training plan by ID', async () => {
      const trainingPlanRepo = dataSource.getRepository(TrainingPlan);

      const trainingPlan = trainingPlanRepo.create({
        name: 'Plan A',
        description: 'Sample training plan description',
        author: { id: userId },
        mainPlan: true,
      });
      const savedTrainingPlan = await trainingPlanRepo.save(trainingPlan);

      const response = await request(app.getHttpServer())
        .get(`/training-plan/get/${savedTrainingPlan.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: savedTrainingPlan.id,
          name: savedTrainingPlan.name,
          description: savedTrainingPlan.description,
          mainPlan: savedTrainingPlan.mainPlan,
        }),
      );
    });

    it('should return 404 if the training plan does not exist', async () => {
      await request(app.getHttpServer())
        .get('/training-plan/get/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });

  describe('/training-plan/update/:id (PATCH)', () => {
    it('should update an existing training plan', async () => {
      const trainingPlanRepo = dataSource.getRepository(TrainingPlan);

      const trainingPlan = trainingPlanRepo.create({
        name: 'Plan A',
        description: 'Sample training plan description',
        author: { id: userId },
        mainPlan: true,
      });
      const savedTrainingPlan = await trainingPlanRepo.save(trainingPlan);

      const updateTrainingPlanDto = { name: 'Updated Plan', mainPlan: false };

      const response = await request(app.getHttpServer())
        .patch(`/training-plan/update/${savedTrainingPlan.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateTrainingPlanDto)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: savedTrainingPlan.id,
          name: updateTrainingPlanDto.name,
          mainPlan: updateTrainingPlanDto.mainPlan,
        }),
      );
    });

    it('should return 404 if the training plan does not exist', async () => {
      const updateTrainingPlanDto = { name: 'Updated Plan' };

      await request(app.getHttpServer())
        .patch('/training-plan/update/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateTrainingPlanDto)
        .expect(404);
    });
  });

  describe('/training-plan/delete/:id (DELETE)', () => {
    it('should delete an existing training plan', async () => {
      const trainingPlanRepo = dataSource.getRepository(TrainingPlan);

      const trainingPlan = trainingPlanRepo.create({
        name: 'Plan A',
        description: 'Sample training plan description',
        author: { id: userId },
        mainPlan: true,
      });
      const savedTrainingPlan = await trainingPlanRepo.save(trainingPlan);

      await request(app.getHttpServer())
        .delete(`/training-plan/delete/${savedTrainingPlan.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const deletedPlan = await trainingPlanRepo.findOne({ where: { id: savedTrainingPlan.id } });
      expect(deletedPlan).toBeNull();
    });

    it('should return 404 if the training plan does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/training-plan/delete/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });
});
