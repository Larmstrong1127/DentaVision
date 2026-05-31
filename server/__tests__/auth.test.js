const request = require('supertest');
const app = require('../app');

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const clinicPayload = {
  name: 'Test Dental Clinic',
  email: 'clinic@test.com',
  password: 'password123',
  phone: '555-1234',
};

const patientPayload = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'patient@test.com',
  password: 'password123',
};

// ─────────────────────────────────────────────
// Clinic Registration
// ─────────────────────────────────────────────
describe('POST /api/auth/clinic/register', () => {
  it('registers a clinic and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/clinic/register')
      .send(clinicPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(clinicPayload.email);
    expect(res.body.user.password).toBeUndefined(); // never exposed
    expect(res.body.message).toMatch(/registration code/i);
  });

  it('rejects duplicate email with 409', async () => {
    await request(app).post('/api/auth/clinic/register').send(clinicPayload);
    const res = await request(app).post('/api/auth/clinic/register').send(clinicPayload);

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/already registered/i);
  });

  it('rejects missing required fields with 400', async () => {
    const res = await request(app)
      .post('/api/auth/clinic/register')
      .send({ email: 'x@x.com' }); // missing name and password

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/name, email and password required/i);
  });

  it('rejects short passwords with 400', async () => {
    const res = await request(app)
      .post('/api/auth/clinic/register')
      .send({ ...clinicPayload, password: 'short' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/at least 8 characters/i);
  });
});

// ─────────────────────────────────────────────
// Clinic Login
// ─────────────────────────────────────────────
describe('POST /api/auth/clinic/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/clinic/register').send(clinicPayload);
  });

  it('returns 403 for pending clinics (not yet approved)', async () => {
    const res = await request(app)
      .post('/api/auth/clinic/login')
      .send({ email: clinicPayload.email, password: clinicPayload.password });

    // Newly registered clinics are "pending" by default
    expect(res.statusCode).toBe(403);
    expect(res.body.status).toBe('pending');
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/clinic/login')
      .send({ email: clinicPayload.email, password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/invalid email or password/i);
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/clinic/login')
      .send({ email: 'nobody@test.com', password: 'password123' });

    expect(res.statusCode).toBe(401);
  });

  it('returns token for approved clinic', async () => {
    // Manually approve the clinic via mongoose
    const Clinic = require('../models/Clinic');
    await Clinic.findOneAndUpdate(
      { email: clinicPayload.email },
      { status: 'approved' }
    );

    const res = await request(app)
      .post('/api/auth/clinic/login')
      .send({ email: clinicPayload.email, password: clinicPayload.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(clinicPayload.email);
  });
});

// ─────────────────────────────────────────────
// Patient Registration
// ─────────────────────────────────────────────
describe('POST /api/auth/patient/register', () => {
  it('registers a patient and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/patient/register')
      .send(patientPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(patientPayload.email);
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects duplicate patient email with 409', async () => {
    await request(app).post('/api/auth/patient/register').send(patientPayload);
    const res = await request(app).post('/api/auth/patient/register').send(patientPayload);

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/already registered/i);
  });

  it('rejects missing required fields with 400', async () => {
    const res = await request(app)
      .post('/api/auth/patient/register')
      .send({ email: 'x@x.com', password: 'password123' }); // missing firstName/lastName

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('rejects invalid clinic code with 404', async () => {
    const res = await request(app)
      .post('/api/auth/patient/register')
      .send({ ...patientPayload, clinicCode: 'BADCODE' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/clinic code not found/i);
  });

  it('links patient to clinic when valid clinic code provided', async () => {
    // Register a clinic first
    const clinicRes = await request(app)
      .post('/api/auth/clinic/register')
      .send(clinicPayload);
    const regCode = clinicRes.body.user.registrationCode;

    const res = await request(app)
      .post('/api/auth/patient/register')
      .send({ ...patientPayload, clinicCode: regCode });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.clinicRegistrationCode).toBe(regCode);
  });
});

// ─────────────────────────────────────────────
// Patient Login
// ─────────────────────────────────────────────
describe('POST /api/auth/patient/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/patient/register').send(patientPayload);
  });

  it('returns token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/patient/login')
      .send({ email: patientPayload.email, password: patientPayload.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/patient/login')
      .send({ email: patientPayload.email, password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
  });

  it('returns 401 for non-existent patient', async () => {
    const res = await request(app)
      .post('/api/auth/patient/login')
      .send({ email: 'ghost@test.com', password: 'password123' });

    expect(res.statusCode).toBe(401);
  });
});

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/no token/i);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer totally.invalid.token');

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/invalid or expired/i);
  });

  it('returns current patient when authenticated', async () => {
    // Register then login to get token
    await request(app).post('/api/auth/patient/register').send(patientPayload);
    const loginRes = await request(app)
      .post('/api/auth/patient/login')
      .send({ email: patientPayload.email, password: patientPayload.password });

    const token = loginRes.body.token;
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(patientPayload.email);
  });
});
