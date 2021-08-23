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

const dome9 = require('./lib/dome9');
const fs = require('fs');

const DATA_DIR = "./data";

const start = async () => {
  init();
  //var policies = await dome9.getContinuousCompliancePolicies();
  //console.log(policies);
  var assumableRoles = await dome9.getAssumableRoles();
  //console.log(assumableRoles);
  for (const assumableRole of assumableRoles) {
    fetchAllLastAssessmentData(assumableRole);
  };
};

const init = async () => {
  if (fs.existsSync(DATA_DIR)) {
    fs.rmdirSync(DATA_DIR, { recursive: true });
  }
  fs.mkdirSync(DATA_DIR);
};

const fetchAllLastAssessmentData = async (assumableRole) => {
  console.log('Fetching last assessment results for ' + assumableRole.accountName);
  var currDir = DATA_DIR + '/' + assumableRole.accountId;
  fs.mkdirSync(currDir);
  var nameFile = currDir + '/name.txt';
  fs.writeFileSync(nameFile, assumableRole.accountName);
  var tokenData = await dome9.assumeRole(assumableRole.accountId, "Super User");
  //console.log(tokenData);
  var childPolicies = await dome9.getContinuousCompliancePolicieWithToken(tokenData.token);
  //console.log(childPolicies);
  for (const childPolicy of childPolicies) {
    //console.log(childPolicy);
    var policyDir = currDir + '/' + childPolicy.targetType + '/' + childPolicy.rulesetId + '/' + childPolicy.targetInternalId;
    fs.mkdirSync(policyDir, { recursive: true });
    var policyFile = policyDir + '/policy.json';
    fs.writeFileSync(policyFile, JSON.stringify(childPolicy));
    var lastAssessmentFile = policyDir + '/lastAssessment.json';
    var lastAssessmentResult = await dome9.lastAssessmentResultsWithToken(
      tokenData.token,
      childPolicy.rulesetId,
      childPolicy.targetInternalId,
      childPolicy.targetType
    );
    fs.writeFileSync(lastAssessmentFile, JSON.stringify(lastAssessmentResult));
    console.log(lastAssessmentResult[0].id);
    var lastAssessmentCSV = policyDir + '/lastAssessment.csv';
    var lastAssessmentResultCSV = await dome9.getAssessmentResultCSVWithToken(tokenData.token, lastAssessmentResult[0].id);
    fs.writeFileSync(lastAssessmentCSV, lastAssessmentResultCSV);
  };
}

start();