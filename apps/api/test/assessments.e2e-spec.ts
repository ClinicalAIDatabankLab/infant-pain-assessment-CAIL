import { beforeAll,describe,expect,it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
let app:INestApplication;
beforeAll(async()=>{const moduleRef=await Test.createTestingModule({imports:[AppModule]}).compile();app=moduleRef.createNestApplication();app.setGlobalPrefix('api');app.useGlobalPipes(new ValidationPipe({whitelist:true,transform:true,forbidNonWhitelisted:true}));await app.init()});
describe('clinical API',()=>{
  it('evaluates quick NIPS with exact recommendation key',async()=>{const response=await request(app.getHttpServer()).post('/api/assessments/evaluate').send({scale:'NIPS',answers:{face:1,cry:1,breathing:1,arms:0,legs:0,arousal:0}}).expect(201);expect(response.body).toMatchObject({scale:'NIPS',score:3,severity:'moderate'});expect(response.body.recommendation.nonMedication.length).toBeGreaterThan(0)});
  it('creates an in-memory encounter and round-trips an assessment',async()=>{const encounter=(await request(app.getHttpServer()).post('/api/encounters').send({preterm:false,ventilated:false,chronicPain:false,postoperative:false,assessmentType:'acute',motherNationalId:'1234567890'}).expect(201)).body;await request(app.getHttpServer()).post(`/api/encounters/${encounter.id}/assessments`).send({scale:'NIPS',answers:{face:0,cry:0,breathing:0,arms:0,legs:0,arousal:0}}).expect(201);const summary=(await request(app.getHttpServer()).get(`/api/encounters/${encounter.id}/summary`).expect(200)).body;expect(summary.assessments).toHaveLength(1);expect(summary.context.motherNationalId).toBe('1234567890')});
});
