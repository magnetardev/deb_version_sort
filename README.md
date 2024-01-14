# deb_version_sort

A very fast spec-complaint debian version sorter.

## Usage

### Comparing Versions

The `compareDebianVersions` function accepts two version strings (including the epoch and revision), `lhs` and `rhs` for debian versions. It is compatible with the `Array.prototype.sort()` and `Array.prototype.toSorted()` functions.

```js
console.assert(compareDebianVersions("1.0", "1.0") === 0);
console.assert(compareDebianVersions("1.1", "1.0") === 1);
console.assert(compareDebianVersions("1.0", "1.1") === -1);
```

### Parse Version

The `parseVersion` function is used internally by compareDebianVersions and is exposed if you need to parse the version string for some other reason. To reduce allocations, it accepts an object to assign its values to.

```js
const version = { epoch: 0, version: "", revision: "" };
parseVersion("1:1.0-1", version);
console.log(version); // { epoch: 1, version: "1.0", revision: "1" };
```

### Comparing Parsed Versions

The `compareParsedDebianVersions` function accepts the parts of a debian version, and compares them.

```js
const versionObject = { epoch: 0, version: "", revision: "" };

parseVersion(lhs, versionObject);
const lhsEpoch = versionObject.epoch;
const lhsVersion = versionObject.version;
const lhsRevision = versionObject.revision;

parseVersion(rhs, versionObject);
const rhsEpoch = versionObject.epoch;
const rhsVersion = versionObject.version;
const rhsRevision = versionObject.revision;

compareParsedDebianVersions(
  lhsEpoch,
  lhsVersion,
  lhsRevision,
  rhsEpoch,
  rhsVersion,
  rhsRevision,
);
```
