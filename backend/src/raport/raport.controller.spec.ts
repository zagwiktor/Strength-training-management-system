import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { TrainingPlan } from 'src/training-plan/entities/training-plan.entity';
import { Raport } from './entities/raport.entity';
import { JwtService } from '@nestjs/jwt';

describe('RaportController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let jwtToken: string;
  let userId: number;
  let trainingPlanId: number;

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

    const trainingPlanRepo = dataSource.getRepository(TrainingPlan);
    const trainingPlan = trainingPlanRepo.create({
      name: 'Plan A',
      description: 'Sample training plan description',
      author: savedUser,
      mainPlan: true,
    });
    const savedTrainingPlan = await trainingPlanRepo.save(trainingPlan);
    trainingPlanId = savedTrainingPlan.id;

    const payload = { sub: userId, username: savedUser.email };
    jwtToken = await jwtService.signAsync(payload, { secret: process.env.JWT_SECRET_KEY });
  });

  describe('/raports/create (POST)', () => {
    it('should create a new raport', async () => {
        const createRaportDto = {
          trainingPlanId,
          weight: 75,
          chestCircuit: 100,
          bicepsCircuit: 40,
          thighCircuit: 60,
          waistCircuit: 80,
          calfCircuit: 35,
          loads: { benchPress: 100 },
          dateCreated: new Date().toISOString(), 
        };
      
        const response = await request(app.getHttpServer())
          .post('/raports/create')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send(createRaportDto)
          .expect(201);
      
        expect(response.body).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            weight: createRaportDto.weight,
            chestCircuit: createRaportDto.chestCircuit,
            bicepsCircuit: createRaportDto.bicepsCircuit,
            thighCircuit: createRaportDto.thighCircuit,
            waistCircuit: createRaportDto.waistCircuit,
            calfCircuit: createRaportDto.calfCircuit,
            loads: createRaportDto.loads,
          }),
        );
      });
  
    it('should return 400 for invalid data', async () => {
      const invalidRaportDto = {
        trainingPlanId,
        weight: -10,
        chestCircuit: 'invalid', 
      };
  
      await request(app.getHttpServer())
        .post('/raports/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidRaportDto)
        .expect(400);
    });
  });

  describe('/raports/get (GET)', () => {
    it('should return all raports for the user', async () => {
      const raportRepo = dataSource.getRepository(Raport);
  
      const raport = raportRepo.create({
        trainingPlan: { id: trainingPlanId } as TrainingPlan,
        author: { id: userId } as User,
        weight: 75,
        chestCircuit: 100,
        bicepsCircuit: 40,
        thighCircuit: 60,
        waistCircuit: 80,
        calfCircuit: 35,
        loads: { benchPress: 100 },
      });
      const savedRaport = await raportRepo.save(raport);
  
      const response = await request(app.getHttpServer())
        .get('/raports/get')
        .set('Authorization', `Bearer ${jwtToken}`)
        .query({ trainingPlanId })
        .expect(200);
  
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: savedRaport.id,
            bicepsCircuit: 40,
            calfCircuit: 35,
            chestCircuit: 100,
            dateCreated: expect.any(String), 
            thighCircuit: 60,
            waistCircuit: 80,
            weight: 75,
            loads: { benchPress: 100 },
          }),
        ]),
      );
    });
  });

  describe('/raports/get/:id (GET)', () => {
    it('should return a specific raport by ID', async () => {
      const raportRepo = dataSource.getRepository(Raport);

      const raport = raportRepo.create({
        trainingPlan: { id: trainingPlanId } as TrainingPlan,
        author: { id: userId } as User,
        weight: 75,
        chestCircuit: 100,
        bicepsCircuit: 40,
        thighCircuit: 60,
        waistCircuit: 80,
        calfCircuit: 35,
        loads: { benchPress: 100 },
      });
      const savedRaport = await raportRepo.save(raport);

      const response = await request(app.getHttpServer())
        .get(`/raports/get/${savedRaport.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: savedRaport.id,
          trainingPlan: expect.objectContaining({ id: trainingPlanId }),
          weight: savedRaport.weight,
        }),
      );
    });

    it('should return 404 if the raport does not exist', async () => {
      await request(app.getHttpServer())
        .get('/raports/get/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });

  describe('/raports/update/:id (PATCH)', () => {
    it('should update an existing raport', async () => {
      const raportRepo = dataSource.getRepository(Raport);

      const raport = raportRepo.create({
        trainingPlan: { id: trainingPlanId } as TrainingPlan,
        author: { id: userId } as User,
        weight: 75,
        chestCircuit: 100,
        bicepsCircuit: 40,
        thighCircuit: 60,
        waistCircuit: 80,
        calfCircuit: 35,
        loads: { benchPress: 100 },
      });
      const savedRaport = await raportRepo.save(raport);

      const updateRaportDto = { weight: 80, chestCircuit: 105 };

      const response = await request(app.getHttpServer())
        .patch(`/raports/update/${savedRaport.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateRaportDto)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: savedRaport.id,
          weight: updateRaportDto.weight,
          chestCircuit: updateRaportDto.chestCircuit,
        }),
      );
    });

    it('should return 404 if the raport does not exist', async () => {
      const updateRaportDto = { weight: 80 };

      await request(app.getHttpServer())
        .patch('/raports/update/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateRaportDto)
        .expect(404);
    });
  });

  describe('/raports/delete/:id (DELETE)', () => {
    it('should delete an existing raport', async () => {
      const raportRepo = dataSource.getRepository(Raport);

      const raport = raportRepo.create({
        trainingPlan: { id: trainingPlanId } as TrainingPlan,
        author: { id: userId } as User,
        weight: 75,
        chestCircuit: 100,
        bicepsCircuit: 40,
        thighCircuit: 60,
        waistCircuit: 80,
        calfCircuit: 35,
        loads: { benchPress: 100 },
      });
      const savedRaport = await raportRepo.save(raport);

      await request(app.getHttpServer())
        .delete(`/raports/delete/${savedRaport.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      const deletedRaport = await raportRepo.findOne({ where: { id: savedRaport.id } });
      expect(deletedRaport).toBeNull();
    });

    it('should return 404 if the raport does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/raports/delete/999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });
});
