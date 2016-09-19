///<reference path="../../typings/modules/typedjson/index.d.ts"/>
import {JsonObject, JsonMember, TypedJSON} from "typedjson";

class Err {
  constructor(
    name: string,
    message: string,
    stack: string
  ){}
}


class Test {
  constructor(
    title: string,
    fullTitle: string,
    timedOut: boolean,
    duration: number,
    state: string,
    speed: string,
    pass: boolean,
    fail: boolean,
    pending: boolean,
    code: string,
    isRoot: boolean,
    uuid: string,
    parentUUID: string,
    skipped: boolean,
    err: Err
  ) {}
}


class Pass {
  constructor(
    title: string,
    fullTitle: string,
    timedOut: boolean,
    duration: number,
    state: string,
    speed: string,
    pass: boolean,
    fail: boolean,
    pending: boolean,
    code: string,
    isRoot: boolean,
    uuid: string,
    parentUUID: string,
    skipped: boolean
  ){}
}


class Failure {
  constructor(
    title: string,
    fullTitle: string,
    timedOut: boolean,
    duration: number,
    state: string,
    pass: boolean,
    fail: boolean,
    pending: boolean,
    code: string,
    err: Err,
    isRoot: boolean,
    uuid: string,
    parentUUID: string,
    skipped: boolean
  ){}
}


class Stats {
  constructor(
    suites: number,
    tests: number,
    passes: number,
    pending: number,
    failures: number,
    start: Date,
    end: Date,
    duration: number,
    testsRegistered: number,
    passPercent: number,
    pendingPercent: number,
    other: number,
    hasOther: boolean,
    skipped: number,
    hasSkipped: boolean,
    passPercentClass: string,
    pendingPercentClass: string
  ){}
}


class Suite {
  constructor(
    title: string,
    suites: Suite[],
    tests: any[],
    pending: any[],
    root: boolean,
    _timeout: number,
    file: string,
    uuid: string,
    fullFile: string,
    passes: any[],
    failures: any[],
    skipped: any[],
    hasTests: boolean,
    hasSuites: boolean,
    totalTests: number,
    totalPasses: number,
    totalFailures: number,
    totalPending: number,
    totalSkipped: number,
    hasPasses: boolean,
    hasFailures: boolean,
    hasPending: boolean,
    hasSkipped: boolean,
    duration: number
  ){}
}


class Suites {
  constructor(
    title: string,
    suites: Suite[],
    tests: any[],
    pending: any[],
    root: boolean,
    _timeout: number,
    uuid: string,
    fullFile: string,
    file: string,
    passes: any[],
    failures: any[],
    skipped: any[],
    hasTests: boolean,
    hasSuites: boolean,
    totalTests: number,
    totalPasses: number,
    totalFailures: number,
    totalPending: number,
    totalSkipped: number,
    hasPasses: boolean,
    hasFailures: boolean,
    hasPending: boolean,
    hasSkipped: boolean,
    duration: number,
    rootEmpty: boolean
  ){}
}


class AllTest {
    constructor(
    title: string,
    fullTitle: string,
    timedOut: boolean,
    duration: number,
    state: string,
    speed: string,
    pass: boolean,
    fail: boolean,
    pending: boolean,
    code: string,
    isRoot: boolean,
    uuid: string,
    parentUUID: string,
    skipped: boolean,
    err: Err
  ){}
}


class AllPass {
  constructor(
    title: string,
    fullTitle: string,
    timedOut: boolean,
    duration: number,
    state: string,
    speed: string,
    pass: boolean,
    fail: boolean,
    pending: boolean,
    code: string,
    isRoot: boolean,
    uuid: string,
    parentUUID: string,
    skipped: boolean
  ){}
}


class AllFailure {
  constructor(
    title: string,
    fullTitle: string,
    timedOut: boolean,
    duration: number,
    state: string,
    pass: boolean,
    fail: boolean,
    pending: boolean,
    code: string,
    err: Err,
    isRoot: boolean,
    uuid: string,
    parentUUID: string,
    skipped: boolean
  ){}
}


@JsonObject
export default class TestReport {
  @JsonMember({ type: String })
  reportTitle: string;

  @JsonMember({ type: Stats })
  stats: Stats;

  @JsonMember({ type:Suites })
  suites: Suites;

  @JsonMember({ elements: AllTest })
  allTests: AllTest[];

  @JsonMember({ elements: Object })
  allPending: any[];

  @JsonMember({ elements: AllPass })
  allPasses: AllPass[];

  @JsonMember({ elements: AllFailure })
  allFailures: AllFailure[];

  @JsonMember({ type: Number })
  copyrightYear: number;
}
