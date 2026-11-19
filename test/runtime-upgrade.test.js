"use strict";

const test = require('node:test');
const assert = require('node:assert/strict');

test('dotenv loads environment configuration', () => {
  const dotenv = require('dotenv');
  const result = dotenv.config();
  assert.equal(typeof result, 'object');
});

test('express creates an application', () => {
  const express = require('express');
  const app = express();
  assert.equal(typeof app, 'function');
  assert.equal(typeof app.listen, 'function');
});

test('mongoose exposes model and connection APIs', () => {
  const mongoose = require('mongoose');
  assert.equal(typeof mongoose.model, 'function');
  assert.equal(typeof mongoose.connect, 'function');
  assert.equal(typeof mongoose.Schema, 'function');
});
