import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import prisma from '../src/config/db';
import { calculateBookingPrice } from '../src/services/bookingService';
import { planCelebrationWithAi } from '../src/services/recommendationService';

const app = createApp();

describe('Eve Planner Backend API Test Suite', () => {
  let customerToken: string;
  let adminToken: string;
  let vendorToken: string;
  let testPackageId: string;

  beforeAll(async () => {
    // Fetch a seeded package ID for testing
    const pkg = await prisma.eventPackage.findFirst({ where: { isActive: true } });
    if (pkg) {
      testPackageId = pkg.id;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Health and Public Endpoints', () => {
    it('GET /api/health should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('Eve Planner API');
    });

    it('GET /api/services/categories should return active categories', async () => {
      const res = await request(app).get('/api/services/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/packages should return pre-built packages', async () => {
      const res = await request(app).get('/api/packages');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('basePrice');
      expect(res.body.data[0]).toHaveProperty('guestCapacity');
    });
  });

  describe('2. Authentication & Role Permissions', () => {
    it('POST /api/auth/login should authenticate seeded Customer', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'riya.sharma@example.com',
        password: 'Customer@123',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('CUSTOMER');
      expect(res.body.data.token).toBeDefined();
      customerToken = res.body.data.token;
    });

    it('POST /api/auth/login should authenticate seeded Admin', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@eveplanner.com',
        password: 'Admin@123',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('ADMIN');
      adminToken = res.body.data.token;
    });

    it('POST /api/auth/login should authenticate seeded Vendor', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'royalpalace@eveplanner.com',
        password: 'Vendor@123',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('VENDOR');
      vendorToken = res.body.data.token;
    });

    it('POST /api/auth/login should reject incorrect password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'riya.sharma@example.com',
        password: 'WrongPassword!',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('Security: Customer cannot access protected Admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it('Security: Unauthenticated request to /api/bookings/my is rejected with 401', async () => {
      const res = await request(app).get('/api/bookings/my');
      expect(res.status).toBe(401);
    });

    it('Admin can successfully access protected /api/admin/stats', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalCustomers');
      expect(res.body.data).toHaveProperty('totalVendors');
    });
  });

  describe('3. Pricing Integrity & Calculations', () => {
    it('Server-side calculateBookingPrice correctly computes base + addons + tax', async () => {
      const pkg = await prisma.eventPackage.findFirst({
        where: { isActive: true },
        include: { addons: true },
      });
      expect(pkg).toBeDefined();

      const addon = pkg?.addons[0];
      const calculation = await calculateBookingPrice({
        packageId: pkg!.id,
        selectedAddons: addon ? [{ addonId: addon.id, quantity: 2 }] : [],
      });

      expect(calculation.baseAmount).toBe(pkg!.basePrice);
      if (addon) {
        expect(calculation.addonsAmount).toBe(addon.price * 2);
      }
      expect(calculation.taxAmount).toBe(
        Math.round((calculation.baseAmount + calculation.addonsAmount) * 0.05)
      );
      expect(calculation.totalAmount).toBe(
        calculation.baseAmount + calculation.addonsAmount + calculation.taxAmount
      );
    });

    it('POST /api/packages/calculate-price returns immediate recalculation', async () => {
      const res = await request(app)
        .post('/api/packages/calculate-price')
        .send({
          packageId: testPackageId,
          selectedAddons: [],
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.grandTotal).toBeGreaterThan(0);
    });
  });

  describe('4. Hybrid AI Celebration Planner & Grounded Fallback', () => {
    it('Generates database-grounded recommendations matching user criteria', async () => {
      const result = await planCelebrationWithAi({
        eventType: 'Birthday',
        guestCount: 30,
        budget: 45000,
        city: 'Delhi NCR',
        themeOrStyle: 'Classic Elegant',
      });

      expect(result).toBeDefined();
      expect(result.topRecommendations.length).toBeGreaterThan(0);
      expect(result.topRecommendations[0]).toHaveProperty('packageId');
      expect(result.topRecommendations[0]).toHaveProperty('actualPrice');
      expect(result.topRecommendations[0]).toHaveProperty('matchExplanation');
      expect(result.celebrationTips.length).toBeGreaterThan(0);
      expect(result.suggestedTimeline.length).toBeGreaterThan(0);
    });

    it('POST /api/ai/recommendations API endpoint returns valid JSON payload', async () => {
      const res = await request(app)
        .post('/api/ai/recommendations')
        .send({
          eventType: 'Anniversary',
          guestCount: 15,
          budget: 35000,
          city: 'Delhi NCR',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.topRecommendations.length).toBeGreaterThan(0);
    });

    it('POST /api/ai/chat returns helpful grounded chatbot guidance', async () => {
      const res = await request(app).post('/api/ai/chat').send({
        message: 'How do pre-built packages work and what is your refund policy?',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reply');
      expect(res.body.data.reply.length).toBeGreaterThan(20);
    });
  });

  describe('5. Vendor Isolation & Multi-Vendor Booking Workflow', () => {
    it('Vendor can fetch their assigned booking requests', async () => {
      const res = await request(app)
        .get('/api/vendors/requests')
        .set('Authorization', `Bearer ${vendorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('Vendor can view their own private analytics', async () => {
      const res = await request(app)
        .get('/api/vendors/analytics')
        .set('Authorization', `Bearer ${vendorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalRequests');
      expect(res.body.data).toHaveProperty('acceptanceRate');
    });

    it('Customer can create a new booking request and retrieve it under /my', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          packageId: testPackageId,
          eventType: 'Birthday',
          eventDate: '2025-12-25',
          startTime: '18:00',
          endTime: '22:00',
          location: 'Vasant Vihar Community Hall',
          city: 'Delhi NCR',
          guestCount: 25,
          specialRequirements: 'Special dietary requests for elderly guests.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('bookingNumber');
      expect(res.body.data.status).toBe('PENDING');

      // Verify it appears in customer's bookings
      const listRes = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(listRes.status).toBe(200);
      const created = listRes.body.data.find((b: any) => b.id === res.body.data.id);
      expect(created).toBeDefined();
    });
  });
});
