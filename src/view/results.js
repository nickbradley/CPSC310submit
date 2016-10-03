function(doc) {
  if (doc.timestamp && doc.team && doc.user && doc.deliverable && doc.report) {
    emit([doc.timestamp, doc.report.stats.passPercent, doc.deliverable, doc.team], {
      repo: doc.team,
      executor: doc.user,
      deliverable: doc.deliverable,
      firstFailure: doc.displayText.indexOf('~') > 0 ? doc.displayText.substring(doc.displayText.indexOf('~')) : "",
      stats: {
        pass: doc.report.stats.passes,
        fail: doc.report.stats.failures,
        skip: doc.report.stats.skipped,
        percentPass: doc.report.stats.passPercent,
        duration: doc.report.stats.duration
      },
      testKeywords: {
        pass: doc.report.allPasses.map(function(test) {
          var testName = test.fullTitle;
          return testName.substring(testName.indexOf('~')+1, testName.lastIndexOf('~'));
        }),
        fail: doc.report.allFailures.map(function(test) {
          var testName = test.fullTitle;
          return testName.substring(testName.indexOf('~')+1, testName.lastIndexOf('~'));
        }),
        skip: doc.report.suites.suites.reduce(function(prevSuiteSkippedTestNames, currSuite) {  // reduce to skipped names per suite
          var skippedTestNames = currSuite.suites.filter(function(suite) {
            return suite.hasSkipped;
          }).map(function(suite) {
            return suite.skipped.map(function(skippedTest) {
              var testName = skippedTest.fullTitle;
              return testName.substring(testName.indexOf('~')+1, testName.lastIndexOf('~'));
            });
          });
          return prevSuiteSkippedTestNames.concat(skippedTestNames);
        }, []).reduce(function(a, b) {  // flatten skipped names per suite into 1D array
          return a.concat(b);
        }, [])
      },
      timestamp: new Date(doc.timestamp)
    });
  }
}

http://skaha.cs.ubc.ca:8079/_utils/database.html?cpsc310/_design/default/_view/results


function(doc) {
  if (doc.timestamp && doc.team && doc.user && doc.deliverable && doc.report) {
    emit(doc.timestamp, {
      repo: doc.team,
      executor: doc.user,
      deliverable: doc.deliverable,
      stats: {
        pass: doc.report.stats.passes,
        fail: doc.report.stats.failures,
        skip: doc.report.stats.skipped,
        percentPass: doc.report.stats.passPercent
      },
      testKeywords: {
        pass: doc.report.allPasses.map(function(test) {
          var testName = test.fullTitle;
          return testName.substring(testName.indexOf('~')+1, testName.lastIndexOf('~'));
        }),
        fail: doc.report.allFailures.map(function(test) {
          var testName = test.fullTitle;
          return testName.substring(testName.indexOf('~')+1, testName.lastIndexOf('~'));
        }),
        skip: doc.report.suites.suites.reduce(function(prevSuiteSkippedTestNames, currSuite) {  // reduce to skipped names per suite
          var skippedTestNames = currSuite.suites.filter(function(suite) {
            return suite.hasSkipped;
          }).map(function(suite) {
            return suite.skipped.map(function(skippedTest) {
              var testName = skippedTest.fullTitle;
              return testName.substring(testName.indexOf('~')+1, testName.lastIndexOf('~'));
            });
          });
          return prevSuiteSkippedTestNames.concat(skippedTestNames);
        }, []).reduce(function(a, b) {  // flatten skipped names per suite into 1D array
          return a.concat(b);
        }, [])
      },
      timestamp: new Date(doc.timestamp)
    });
  }
}



function(doc) {
  if (doc.timestamp && doc.team && doc.user && doc.deliverable && doc.report) {
    emit(doc.timestamp, {
      repo: doc.team,
      executor: doc.user,
      deliverable: doc.deliverable,
      stats: {
        pass: doc.report.stats.passes,
        fail: doc.report.stats.failures,
        skip: doc.report.stats.skipped,
        percentPass: doc.report.stats.passPercent
      },
      testKeywords: {
        pass: doc.report.allPasses.map(function (test) {
          var testName = test.fullTitle;
          return testName.substring(1, testName.lastIndexOf('~'));
        }),
        fail: doc.report.allFailures.map(function (test) {
          var testName = test.fullTitle;
          return testName.substring(1, testName.lastIndexOf('~'));
        }),
        skip: doc.report.suites.suites.filter(function (suite) {
          return suite.hasSkipped;
        }).map(function (suite) {
          return suite.skipped;
        }).map(function (test) {
            var testName = test.fullTitle;
            return testName.substring(1, testName.lastIndexOf('~'));
        })
      },
      timestamp: new Date(doc.timestamp)
    });
  }
}




function(doc) {
  if (doc.timestamp && doc.team && doc.user && doc.deliverable && doc.report) {
    emit(doc.timestamp, {
      repo: doc.team,
      executor: doc.user,
      deliverable: doc.deliverable,
      stats: {
        pass: doc.report.stats.passes,
        fail: doc.report.stats.failures,
        skip: doc.report.stats.skipped,
        percentPass: doc.report.stats.passPercent
      },
      testKeywords: {
        pass: doc.report.allPasses.map(function (test) {
          var testName = test.fullTitle;
          return testName.substring(1, testName.lastIndexOf('~'));
        }),
        fail: doc.report.allFailures.map(function (test) {
          var testName = test.fullTitle;
          return testName.substring(1, testName.lastIndexOf('~'));
        }),
        skip: doc.report.suites.suites.filter(function (suite) {
          return suite.hasSkipped;
        }).skipped.map(function (test) {
            var testName = test.fullTitle;
            return testName.substring(1, testName.lastIndexOf('~'));
        })
      },
      timestamp: new Date(doc.timestamp)
    });
  }
}



function(doc) {
  if (doc.timestamp && doc.team && doc.user && doc.deliverable && doc.report) {
    emit(doc.timestamp, {
      repo: doc.team,
      executor: doc.user,
      deliverable: doc.deliverable,
      stats: {
        pass: doc.report.stats.passes,
        fail: doc.report.stats.failures,
        skip: doc.report.stats.skipped,
        percentPass: doc.report.stats.passPercent
      },
      testKeywords: {
        pass: doc.report.allPasses.map(function (test) {
          var testName = test.fullTitle;
          return testName.substring(1, testName.lastIndexOf('~'));
        }),
        fail: doc.report.allFailures.map(function (test) {
          var testName = test.fullTitle;
          return testName.substring(1, testName.lastIndexOf('~'));
        }),
        skip: doc.report.allTests.filter(function (test) {
          return test.skipped;
        }).map(function (test) {
            var testName = test.fullTitle;
            return testName.substring(1, testName.lastIndexOf('~'));
        })
      },
      timestamp: new Date(doc.timestamp)
    });
  }
}





(timestamp, repo, executor, #pass, #fail, #skip, #passPercentage, [pass test keywords], [fail test keywords], [skip test keywords]).

[1:32]
oh, and full text of the error sent back





{
   "latest_run": {
       "map": "function(doc) {\n  if (doc.team && doc.user)\n    emit(doc.team+\"/\"+doc.user, doc.timestamp);\n}",
       "reduce": "function (key, values, rereduce) {\n  return Math.max.apply(null, values);\n  \n}"
   }
}
