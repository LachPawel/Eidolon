import { expect } from 'chai';
import request from 'supertest';
import { createTestApp } from './app.js';
import { cleanDatabase, closeDatabase } from './setup.js';

const app = createTestApp();

describe('Articles API', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/articles', () => {
    it('should create a new article', async () => {
      const articleData = {
        organization: 'Test Corp',
        name: 'Test Article',
        status: 'active',
        shopFloorSchema: [
          {
            key: 'weight',
            label: 'Weight',
            type: 'number',
            validation: { required: true, min: 0, max: 100 }
          }
        ]
      };

      const res = await request(app)
        .post('/api/articles')
        .send(articleData)
        .expect(201);

      expect(res.body).to.have.property('id');
      expect(res.body.name).to.equal('Test Article');
      expect(res.body.organization).to.equal('Test Corp');
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/articles')
        .send({ organization: 'Test Corp' })
        .expect(400);

      expect(res.body.error).to.equal('Organization and Name are required');
    });
  });

  describe('GET /api/articles', () => {
    it('should return empty array when no articles exist', async () => {
      const res = await request(app)
        .get('/api/articles')
        .expect(200);

      expect(res.body.articles).to.be.an('array').that.is.empty;
    });

    it('should filter articles by organization', async () => {
      // Create two articles
      await request(app)
        .post('/api/articles')
        .send({ organization: 'Corp A', name: 'Article A' });
      
      await request(app)
        .post('/api/articles')
        .send({ organization: 'Corp B', name: 'Article B' });

      const res = await request(app)
        .get('/api/articles?organization=Corp A')
        .expect(200);

      expect(res.body.articles).to.have.lengthOf(1);
      expect(res.body.articles[0].organization).to.equal('Corp A');
    });

    it('should search articles by name', async () => {
      await request(app)
        .post('/api/articles')
        .send({ organization: 'Test', name: 'Steel Pipe' });
      
      await request(app)
        .post('/api/articles')
        .send({ organization: 'Test', name: 'Copper Wire' });

      const res = await request(app)
        .get('/api/articles?search=Pipe')
        .expect(200);

      expect(res.body.articles).to.have.lengthOf(1);
      expect(res.body.articles[0].name).to.include('Pipe');
    });
  });
});