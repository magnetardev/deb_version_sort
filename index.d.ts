export function parseVersion(string: string, dest: { epoch: number; version: string; revision: string }): void;

export function compareParsedDebianVersions(
	lhsEpoch: number,
	lhsVersion: string,
	lhsRevision: string,
	rhsEpoch: number,
	rhsVersion: string,
	rhsRevision: string,
): 0 | 1 | -1;

export function compareDebianVersions(lhs: string, rhs: string): 0 | 1 | -1;
