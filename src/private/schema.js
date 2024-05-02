"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryCategory = exports.Severity = void 0;
var Severity;
(function (Severity) {
    Severity["CRITICAL"] = "critical";
    Severity["HIGH"] = "high";
    Severity["MEDIUM"] = "medium";
    Severity["LOW"] = "low";
    Severity["INFO"] = "info";
    Severity["TRACE"] = "trace";
})(Severity = exports.Severity || (exports.Severity = {}));
var QueryCategory;
(function (QueryCategory) {
    QueryCategory["ACCESS_CONTROL"] = "Access Control";
    QueryCategory["AVAILABILITY"] = "Availability";
    QueryCategory["BACKUP"] = "Backup";
    QueryCategory["BEST_PRACTICES"] = "Best Practices";
    QueryCategory["BUILD_PROCESS"] = "Build Process";
    QueryCategory["ENCRYPTION"] = "Encryption";
    QueryCategory["INSECURE_CONFIGURATIONS"] = "Insecure Configurations";
    QueryCategory["INSECURE_DEFAULTS"] = "Insecure Defaults";
    QueryCategory["NETWORKING_AND_FIREWALL"] = "Networking and Firewall";
    QueryCategory["OBSERVABILITY"] = "Observability";
    QueryCategory["RESOURCE_MANAGEMENT"] = "Resource Management";
    QueryCategory["SECRET_MANAGEMENT"] = "Secret Management";
    QueryCategory["STRUCTURE_AND_SEMANTICS"] = "Structure and Semantics";
    QueryCategory["SUPPLY_CHAIN"] = "Supply-Chain";
})(QueryCategory = exports.QueryCategory || (exports.QueryCategory = {}));
