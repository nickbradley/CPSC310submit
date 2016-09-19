"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var typedjson_1 = require("typedjson");
var Err = (function () {
    function Err(name, message, stack) {
    }
    return Err;
}());
var Test = (function () {
    function Test(title, fullTitle, timedOut, duration, state, speed, pass, fail, pending, code, isRoot, uuid, parentUUID, skipped, err) {
    }
    return Test;
}());
var Pass = (function () {
    function Pass(title, fullTitle, timedOut, duration, state, speed, pass, fail, pending, code, isRoot, uuid, parentUUID, skipped) {
    }
    return Pass;
}());
var Failure = (function () {
    function Failure(title, fullTitle, timedOut, duration, state, pass, fail, pending, code, err, isRoot, uuid, parentUUID, skipped) {
    }
    return Failure;
}());
var Stats = (function () {
    function Stats(suites, tests, passes, pending, failures, start, end, duration, testsRegistered, passPercent, pendingPercent, other, hasOther, skipped, hasSkipped, passPercentClass, pendingPercentClass) {
    }
    return Stats;
}());
var Suite = (function () {
    function Suite(title, suites, tests, pending, root, _timeout, file, uuid, fullFile, passes, failures, skipped, hasTests, hasSuites, totalTests, totalPasses, totalFailures, totalPending, totalSkipped, hasPasses, hasFailures, hasPending, hasSkipped, duration) {
    }
    return Suite;
}());
var Suites = (function () {
    function Suites(title, suites, tests, pending, root, _timeout, uuid, fullFile, file, passes, failures, skipped, hasTests, hasSuites, totalTests, totalPasses, totalFailures, totalPending, totalSkipped, hasPasses, hasFailures, hasPending, hasSkipped, duration, rootEmpty) {
    }
    return Suites;
}());
var AllTest = (function () {
    function AllTest(title, fullTitle, timedOut, duration, state, speed, pass, fail, pending, code, isRoot, uuid, parentUUID, skipped, err) {
    }
    return AllTest;
}());
var AllPass = (function () {
    function AllPass(title, fullTitle, timedOut, duration, state, speed, pass, fail, pending, code, isRoot, uuid, parentUUID, skipped) {
    }
    return AllPass;
}());
var AllFailure = (function () {
    function AllFailure(title, fullTitle, timedOut, duration, state, pass, fail, pending, code, err, isRoot, uuid, parentUUID, skipped) {
    }
    return AllFailure;
}());
var TestReport = (function () {
    function TestReport() {
    }
    __decorate([
        typedjson_1.JsonMember({ type: String }), 
        __metadata('design:type', String)
    ], TestReport.prototype, "reportTitle", void 0);
    __decorate([
        typedjson_1.JsonMember({ type: Stats }), 
        __metadata('design:type', Stats)
    ], TestReport.prototype, "stats", void 0);
    __decorate([
        typedjson_1.JsonMember({ type: Suites }), 
        __metadata('design:type', Suites)
    ], TestReport.prototype, "suites", void 0);
    __decorate([
        typedjson_1.JsonMember({ elements: AllTest }), 
        __metadata('design:type', Array)
    ], TestReport.prototype, "allTests", void 0);
    __decorate([
        typedjson_1.JsonMember({ elements: Object }), 
        __metadata('design:type', Array)
    ], TestReport.prototype, "allPending", void 0);
    __decorate([
        typedjson_1.JsonMember({ elements: AllPass }), 
        __metadata('design:type', Array)
    ], TestReport.prototype, "allPasses", void 0);
    __decorate([
        typedjson_1.JsonMember({ elements: AllFailure }), 
        __metadata('design:type', Array)
    ], TestReport.prototype, "allFailures", void 0);
    __decorate([
        typedjson_1.JsonMember({ type: Number }), 
        __metadata('design:type', Number)
    ], TestReport.prototype, "copyrightYear", void 0);
    TestReport = __decorate([
        typedjson_1.JsonObject, 
        __metadata('design:paramtypes', [])
    ], TestReport);
    return TestReport;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestReport;
//# sourceMappingURL=testReport.js.map