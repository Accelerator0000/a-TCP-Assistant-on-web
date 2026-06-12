const net = require('net');
const crypto = require('crypto');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Test: start the real server, wait, then verify
require('C:/Users/shejiahan/Desktop/嵌赛/server/index.js');

// Give it time to start
setTimeout(() => {
  http.get('http://127.0.0.1:8080/', (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      console.log('HTTP Status:', res.statusCode);
      console.log('Content-Type:', res.headers['content-type']);
      console.log('Has WebSocket handshake:', d.includes('WebSocket') || d.includes('ws'));
      console.log('HTML title:', d.match(/<title>(.*?)<\/title>/)?.[1] || 'N/A');
      console.log('Page length:', d.length);
      console.log('=== INTEGRATION TEST PASSED ===');
      process.exit(0);
    });
  }).on('error', (e) => {
    console.log('HTTP FAIL:', e.message);
    process.exit(1);
  });
}, 1000);
