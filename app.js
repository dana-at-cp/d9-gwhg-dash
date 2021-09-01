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

const dome9 = require('./lib/dome9');
const fs = require('fs');
const yargs = require('yargs');

const DATA_DIR = "./data";

var argv = yargs
  .usage('Usage: $0 <command> [options]')
  .command('trends', 'Get 30 and 90 day trend data for continuous compliance policies')
  .example('$0 trends -a all', 'Get continuous compliance trends for all accounts')
  .example('$0 trends -a 1337', 'Get continuous compliance trends for specific child account')
  .command('last', 'Get last assessment results for continuous compliance policies')
  .example('$0 last -a parent', 'Get last assessment results for parent account')
  .alias('a', 'account')
  .nargs('a', 1)
  .describe('a', 'Specifiy account (all, parent, child account number)')
  .default('a', 'all')
  .demandCommand(1, 'Please specify one command (last or trends)')
  .demandOption(['a'])
  .help('h')
  .alias('h', 'help')
  .epilog('Copyright 2021 Dana James Traversie, Check Point Software Technologies, Ltd.')
  .check((argv, options) => {
    const cmds = argv._;
    if (cmds.length != 1) {
      throw new Error('Only one command can be specified (last or trends)');
    } else if (!(cmds.includes('last') || cmds.includes('trends'))) {
      throw new Error('Invalid command specified: ' + cmds);
    } else {
      return true;
    };
  })
  .argv;

const start = async () => {
  init();
  const getLast = argv._.includes('last');
  const getTrends = argv._.includes('trends');
  const includeParent = (argv.a == 'all' || argv.a == 'parent');
  const includeChildren = argv.a != 'parent';
  const isolateChild = (argv.a != 'all' && argv.a != 'parent');
  if (includeParent) {
    fetchAssessmentData(getLast, getTrends);
  };
  if (includeChildren) {
    var assumableRoles = await dome9.getAssumableRoles();
    if (isolateChild) {
      assumableRoles = assumableRoles.filter(r => r.accountId == argv.a);
    };
    for (const assumableRole of assumableRoles) {
      fetchChildAssessmentData(assumableRole, getLast, getTrends);
    };
  };
};

const init = async () => {
  if (fs.existsSync(DATA_DIR)) {
    fs.rmdirSync(DATA_DIR, { recursive: true });
  };
  fs.mkdirSync(DATA_DIR);
};

const fetchAssessmentData = async (getLast, getTrends) => {
  var currDir = DATA_DIR + '/parent';
  fs.mkdirSync(currDir, { recursive: true });
  const policies = await dome9.getContinuousCompliancePolicies();
  for (const policy of policies) {
    var policyDir = currDir + '/' + policy.targetType + '/' + policy.rulesetId + '/' + policy.targetInternalId;
    fs.mkdirSync(policyDir, { recursive: true });
    var policyFile = policyDir + '/policy.json';
    writeFile(policyFile, JSON.stringify(policy));
    if (getLast) {
      getLastAssessment(policyDir, policy);
    };
    if (getTrends) {
      get30DayTrend(policyDir, policy);
      get90DayTrend(policyDir, policy);
    };
  };
};

const fetchChildAssessmentData = async (assumableRole, getLast, getTrends) => {
  console.log('Fetching assessment data for ' + assumableRole.accountName);
  var currDir = DATA_DIR + '/' + assumableRole.accountId;
  fs.mkdirSync(currDir, { recursive: true });
  var nameFile = currDir + '/name.txt';
  writeFile(nameFile, assumableRole.accountName);
  var tokenData = await dome9.assumeRole(assumableRole.accountId, "Super User");
  var childPolicies = await dome9.getContinuousCompliancePoliciesWithToken(tokenData.token);
  for (const childPolicy of childPolicies) {
    var policyDir = currDir + '/' + childPolicy.targetType + '/' + childPolicy.rulesetId + '/' + childPolicy.targetInternalId;
    fs.mkdirSync(policyDir, { recursive: true });
    var policyFile = policyDir + '/policy.json';
    writeFile(policyFile, JSON.stringify(childPolicy));
    if (getLast) {
      getLastAssessmentWithToken(policyDir, tokenData, childPolicy);
    };
    if (getTrends) {
      get30DayTrendWithToken(policyDir, tokenData, childPolicy);
      get90DayTrendWithToken(policyDir, tokenData, childPolicy);
    };
  };
};

const get30DayTrend = async (workingDir, policy) => {
  var f = workingDir + '/trends30Day.json';
  var r = await dome9.get30DayAssessmentTrends(
    policy.rulesetId,
    policy.targetInternalId
  );
  writeFile(f, JSON.stringify(r));
};

const get90DayTrend = async (workingDir, policy) => {
  var f = workingDir + '/trends90Day.json';
  var r = await dome9.get90DayAssessmentTrends(
    policy.rulesetId,
    policy.targetInternalId
  );
  writeFile(f, JSON.stringify(r));
};

const getLastAssessment = async (workingDir, policy) => {
  var lastAssessmentFile = workingDir + '/lastAssessment.json';
  var lastAssessmentResult = await dome9.lastAssessmentResults(
    policy.rulesetId,
    policy.targetInternalId,
    policy.targetType
  );
  writeFile(lastAssessmentFile, JSON.stringify(lastAssessmentResult));
  console.log(lastAssessmentResult[0].id);
  var lastAssessmentCSV = workingDir + '/lastAssessment.csv';
  var lastAssessmentResultCSV = await dome9.getAssessmentResultCSV(lastAssessmentResult[0].id);
  writeFile(lastAssessmentCSV, lastAssessmentResultCSV);
};

const get30DayTrendWithToken = async (workingDir, tokenData, childPolicy) => {
  var f = workingDir + '/trends30Day.json';
  var r = await dome9.get30DayAssessmentTrendsWithToken(
    tokenData.token,
    childPolicy.rulesetId,
    childPolicy.targetInternalId
  );
  writeFile(f, JSON.stringify(r));
};

const get90DayTrendWithToken = async (workingDir, tokenData, childPolicy) => {
  var f = workingDir + '/trends90Day.json';
  var r = await dome9.get90DayAssessmentTrendsWithToken(
    tokenData.token,
    childPolicy.rulesetId,
    childPolicy.targetInternalId
  );
  writeFile(f, JSON.stringify(r));
};

const getLastAssessmentWithToken = async (workingDir, tokenData, childPolicy) => {
  var lastAssessmentFile = workingDir + '/lastAssessment.json';
  var lastAssessmentResult = await dome9.lastAssessmentResultsWithToken(
    tokenData.token,
    childPolicy.rulesetId,
    childPolicy.targetInternalId,
    childPolicy.targetType
  );
  writeFile(lastAssessmentFile, JSON.stringify(lastAssessmentResult));
  console.log(lastAssessmentResult[0].id);
  var lastAssessmentCSV = workingDir + '/lastAssessment.csv';
  var lastAssessmentResultCSV = await dome9.getAssessmentResultCSVWithToken(tokenData.token, lastAssessmentResult[0].id);
  writeFile(lastAssessmentCSV, lastAssessmentResultCSV);
};

const writeFile = async (file, data) => {
  fs.writeFile(file, data, (err) => {
    if (err) {
      console.error(err);
    };
  });
};

start();