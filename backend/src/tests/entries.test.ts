import { expect } from 'chai';
import request from 'supertest';
import { createTestApp } from './app.js';
import { cleanDatabase, closeDatabase } from './setup.js';

const app = createTestApp();

describe('Entries API', () => {
  let articleId: string;

  beforeEach(async () => {
    await cleanDatabase();
    
    // Create a test article
    const res = await request(app)
      .post('/api/articles')
      .send({
        organization: 'Test Corp',
        name: 'Test Article',
        status: 'active',
        shopFloorSchema: [
          {
            key: 'weight',
            label: 'Weight (kg)',
            type: 'number',
            validation: { required: true, min: 10, max: 100 }
          },
          {
            key: 'quality',
            label: 'Quality Check',
            type: 'select',
            validation: { required: true, options: ['Pass', 'Fail'] }
          }
        ]
      });
    
    articleId = res.body.id;
  });

  describe('POST /api/entries', () => {
    it('should create a valid entry', async () => {
      const entryData = {
        articleId,
        organization: 'Test Corp',
        data: {
          weight: 50,
          quality: 'Pass'
        }
      };

      const res = await request(app)
        .post('/api/entries')
        .send(entryData)
        .expect(201);

      expect(res.body).to.have.property('id');
      expect(res.body.articleId).to.equal(articleId);
      expect(res.body.data.weight).to.equal(50);
    });

    it('should reject entry with missing required field', async () => {
      const res = await request(app)
        .post('/api/entries')
        .send({
          articleId,
          organization: 'Test Corp',
          data: { quality: 'Pass' } // Missing 'weight'
        })
        .expect(400);

      expect(res.body.error).to.equal('Validation Failed');
      expect(res.body.details).to.be.an('array');
    });

    it('should reject entry with out-of-range number', async () => {
      const res = await request(app)
        .post('/api/entries')
        .send({
          articleId,
          organization: 'Test Corp',
          data: { weight: 150, quality: 'Pass' } // Weight > 100
        })
        .expect(400);

      expect(res.body.details).to.include.members([
        "Field 'Weight (kg)' must be at most 100."
      ]);
    });

    it('should reject entry with invalid select option', async () => {
      const res = await request(app)
        .post('/api/entries')
        .send({
          articleId,
          organization: 'Test Corp',
          data: { weight: 50, quality: 'Maybe' } // Invalid option
        })
        .expect(400);

      expect(res.body.details).to.include.members([
        "Field 'Quality Check' has an invalid selection."
      ]);
    });

    it('should return 404 for non-existent article', async () => {
      const res = await request(app)
        .post('/api/entries')
        .send({
          articleId: '00000000-0000-0000-0000-000000000000',
          organization: 'Test',
          data: {}
        })
        .expect(404);

      expect(res.body.error).to.equal('Article not found');
    });
  });
});