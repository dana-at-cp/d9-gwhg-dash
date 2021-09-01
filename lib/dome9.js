// Copyright 2021 Dana James Traversie, Check Point Software Technologies, Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

const axios = require('axios');
const moment = require('moment');

const D9_BASE_URL = 'https://api.dome9.com/v2';
const D9_ID = process.env.D9_ID;
const D9_SECRET = process.env.D9_SECRET;

const D9_CLIENT = axios.create({
  baseURL: D9_BASE_URL,
  auth: {
    username: D9_ID,
    password: D9_SECRET
  }
});

/**
 * 
 * @param {*} bundleId 
 * @param {*} cloudAccountId 
 * @param {*} from 
 * @param {*} to 
 * @returns 
 */
exports.getAssessmentTrends = async (bundleId, cloudAccountId, from, to) => {
  const params = {
    bundleId: bundleId,
    cloudAccountId: cloudAccountId,
    from: from.toISOString(),
    to: to.toISOString()
  };
  var r = await D9_CLIENT.get('/AssessmentHistoryV2/assessmentTrendV2', { params });
  return r ? r.data : [];
};

/**
 * 
 * @param {*} token 
 * @param {*} bundleId 
 * @param {*} cloudAccountId 
 * @param {*} from 
 * @param {*} to 
 * @returns 
 */
exports.getAssessmentTrendsWithToken = async (token, bundleId, cloudAccountId, from, to) => {
  const client = axios.create({
    baseURL: D9_BASE_URL,
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const params = {
    bundleId: bundleId,
    cloudAccountId: cloudAccountId,
    from: from.toISOString(),
    to: to.toISOString()
  };
  var r = await client.get('/AssessmentHistoryV2/assessmentTrendV2', { params });
  return r ? r.data : [];
};

/**
 * 
 * @param {*} bundleId 
 * @param {*} cloudAccountId 
 * @returns 
 */
exports.get30DayAssessmentTrends = async (bundleId, cloudAccountId) => {
  const to = moment(new Date());
  const from = to.clone().add(-30, 'days');
  return await this.getAssessmentTrends(bundleId, cloudAccountId, from, to);
};

/**
 * 
 * @param {*} token 
 * @param {*} bundleId 
 * @param {*} cloudAccountId 
 * @returns 
 */
exports.get30DayAssessmentTrendsWithToken = async (token, bundleId, cloudAccountId) => {
  const to = moment(new Date());
  const from = to.clone().add(-30, 'days');
  return await this.getAssessmentTrendsWithToken(token, bundleId, cloudAccountId, from, to);
};

/**
 * 
 * @param {*} bundleId 
 * @param {*} cloudAccountId 
 * @returns 
 */
exports.get90DayAssessmentTrends = async (bundleId, cloudAccountId) => {
  const to = moment(new Date());
  const from = to.clone().add(-90, 'days');
  return await this.getAssessmentTrends(bundleId, cloudAccountId, from, to);
};

/**
 * 
 * @param {*} token 
 * @param {*} bundleId 
 * @param {*} cloudAccountId 
 * @returns 
 */
exports.get90DayAssessmentTrendsWithToken = async (token, bundleId, cloudAccountId) => {
  const to = moment(new Date());
  const from = to.clone().add(-90, 'days');
  return await this.getAssessmentTrendsWithToken(token, bundleId, cloudAccountId, from, to);
};

/**
 * 
 * @param {*} assessmentResultId 
 * @returns 
 */
exports.getAssessmentResultCSV = async (assessmentResultId) => {
  var r = await D9_CLIENT.get('/AssessmentHistoryV2/csv/' + assessmentResultId);
  return r ? r.data : [];
};

/**
 * 
 * @param {*} token 
 * @param {*} assessmentResultId 
 * @returns 
 */
exports.getAssessmentResultCSVWithToken = async (token, assessmentResultId) => {
  const client = axios.create({
    baseURL: D9_BASE_URL,
    headers: { 'Authorization': 'Bearer ' + token }
  });
  var r = await client.get('/AssessmentHistoryV2/csv/' + assessmentResultId);
  return r ? r.data : [];
};

/**
 * 
 * @param {*} bundleId 
 * @param {*} cloudAccountId 
 * @param {*} cloudAccountType 
 * @returns 
 */
exports.lastAssessmentResults = async (bundleId, cloudAccountId, cloudAccountType) => {
  var payload = {
    "cloudAccountBundleFilters": [
      {
        "bundleIds": [
          bundleId
        ],
        "cloudAccountIds": [
          cloudAccountId
        ],
        "cloudAccountType": cloudAccountType
      }
    ]
  };
  var r = await D9_CLIENT.post(
    '/AssessmentHistoryV2/LastAssessmentResults',
    payload,
    {
      headers: {
        "Content-Type": "application/json;charset=utf-8"
      }
    }
  );
  return r ? r.data : {};
};

/**
 * 
 * @param {*} token 
 * @param {*} bundleId 
 * @param {*} cloudAccountId 
 * @param {*} cloudAccountType 
 * @returns 
 */
exports.lastAssessmentResultsWithToken = async (token, bundleId, cloudAccountId, cloudAccountType) => {
  const client = axios.create({
    baseURL: D9_BASE_URL,
    headers: { 'Authorization': 'Bearer ' + token }
  });
  var payload = {
    "cloudAccountBundleFilters": [
      {
        "bundleIds": [
          bundleId
        ],
        "cloudAccountIds": [
          cloudAccountId
        ],
        "cloudAccountType": cloudAccountType
      }
    ]
  };
  var r = await client.post(
    '/AssessmentHistoryV2/LastAssessmentResults',
    payload,
    {
      headers: {
        "Content-Type": "application/json;charset=utf-8"
      }
    }
  );
  return r ? r.data : {};
};

/**
 * 
 * @returns 
 */
exports.getContinuousCompliancePolicies = async () => {
  var r = await D9_CLIENT.get('/ContinuousCompliancePolicyV2');
  return r ? r.data : [];
};

/**
 * 
 * @param {*} token 
 * @returns 
 */
exports.getContinuousCompliancePoliciesWithToken = async (token) => {
  const client = axios.create({
    baseURL: D9_BASE_URL,
    headers: { 'Authorization': 'Bearer ' + token }
  });
  var r = await client.get('/ContinuousCompliancePolicyV2');
  return r ? r.data : [];
};

/**
 * 
 * @returns 
 */
exports.getAssumableRoles = async () => {
  var r = await D9_CLIENT.get('/AccountTrust/assumable-roles');
  return r ? r.data : [];
};

/**
 * 
 * @param {*} accountId 
 * @param {*} roleName 
 * @returns 
 */
exports.assumeRole = async (accountId, roleName) => {
  var payload = { "accountId": accountId, "roleName": roleName };
  var r = await D9_CLIENT.post(
    '/auth/assume-role/jwt',
    payload,
    {
      headers: {
        "Content-Type": "application/json;charset=utf-8"
      }
    }
  );
  return r ? r.data : {};
};