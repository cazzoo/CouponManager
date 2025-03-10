/**
 * Mock Service Worker API Handlers
 * 
 * This file defines request handlers for the Mock Service Worker.
 * These handlers intercept API requests and return mock responses during development.
 */

import { http, HttpResponse, delay } from 'msw';
import { mockUsers, mockCoupons } from './data';

// Utility to simulate network delay for a more realistic experience
const ARTIFICIAL_DELAY_MS = 300;

// In-memory data store to maintain state between requests
let users = [...mockUsers];
let coupons = [...mockCoupons];
let nextCouponId = 100; // Starting ID for new coupons

export const handlers = [
  // Authentication handlers
  http.post('*/auth/v1/token', async ({ request }) => {
    await delay(ARTIFICIAL_DELAY_MS);
    
    const body = await request.json();
    const user = users.find(u => u.email === body.email && u.password === body.password);
    
    if (!user) {
      return new HttpResponse(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      access_token: `mock-token-${user.id}`,
      refresh_token: `mock-refresh-${user.id}`,
      expires_in: 3600,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    });
  }),
  
  // User handlers
  http.get('*/auth/v1/user', () => {
    // Get current user (in a real app, would be determined from token)
    const user = users[0]; // For simplicity, return the first user
    
    return HttpResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }),
  
  // Coupon handlers
  http.get('*/rest/v1/coupons', () => {
    return HttpResponse.json(
      coupons.map((coupon, index) => ({
        ...coupon,
        id: coupon.id || index + 1
      }))
    );
  }),
  
  http.post('*/rest/v1/coupons', async ({ request }) => {
    await delay(ARTIFICIAL_DELAY_MS);
    
    const newCoupon = await request.json();
    const couponWithId = { 
      ...newCoupon, 
      id: nextCouponId++
    };
    
    coupons.push(couponWithId);
    
    return HttpResponse.json({
      id: couponWithId.id,
      status: 'success'
    }, { status: 201 });
  }),
  
  http.patch('*/rest/v1/coupons', async ({ request }) => {
    await delay(ARTIFICIAL_DELAY_MS);
    
    const updatedCoupon = await request.json();
    const index = coupons.findIndex(c => c.id === updatedCoupon.id);
    
    if (index === -1) {
      return new HttpResponse(
        JSON.stringify({ error: 'Coupon not found' }),
        { status: 404 }
      );
    }
    
    coupons[index] = { ...coupons[index], ...updatedCoupon };
    
    return HttpResponse.json({
      status: 'success',
      updatedCoupon: coupons[index]
    });
  }),
  
  http.delete('*/rest/v1/coupons', async ({ request, params }) => {
    await delay(ARTIFICIAL_DELAY_MS);
    
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id'));
    
    if (!id) {
      return new HttpResponse(
        JSON.stringify({ error: 'Missing coupon ID' }),
        { status: 400 }
      );
    }
    
    const index = coupons.findIndex(c => c.id === id);
    
    if (index === -1) {
      return new HttpResponse(
        JSON.stringify({ error: 'Coupon not found' }),
        { status: 404 }
      );
    }
    
    const deletedCoupon = coupons[index];
    coupons.splice(index, 1);
    
    return HttpResponse.json({
      status: 'success',
      deleted: deletedCoupon.id
    });
  })
]; 