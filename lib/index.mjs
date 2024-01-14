const ORDERING_EQ = 0;
const ORDERING_GT = 1;
const ORDERING_LT = -1;

const TILDE_ASCII = 126;
const PARSE_VERSION_OBJ = { epoch: 0, version: "", revision: "" };

/** @param {number} ascii */
function isAsciiDigit(ascii) {
	return ascii >= 48 && ascii <= 57;
}

/** @param {number} ascii */
function order(ascii) {
	if (isAsciiDigit(ascii)) {
		return 0;
	}
	if ((ascii >= 65 && ascii <= 90) || (ascii >= 97 && ascii <= 122)) {
		return ascii;
	}
	if (ascii === TILDE_ASCII) {
		return -1;
	}
	return +(ascii !== 0) * ascii + 256;
}

/**
 * @param {string} lhs
 * @param {string} rhs
 * @returns {0 | 1 | -1}
 */
function compareFragment(lhs, rhs) {
	let lhsI = 0;
	let rhsI = 0;

	let lhsChar = lhs.charCodeAt(lhsI++);
	let rhsChar = rhs.charCodeAt(rhsI++);

	while (true) {
		if (Number.isNaN(lhsChar) || Number.isNaN(rhsChar)) {
			break;
		}

		while (
			(!Number.isNaN(lhsChar) && !isAsciiDigit(lhsChar)) ||
			(!Number.isNaN(rhsChar) && !isAsciiDigit(rhsChar))
		) {
			const ordering = order(lhsChar | 0) - order(rhsChar | 0);
			if (ordering) {
				return Math.max(Math.min(ordering, 1), -1);
			}
			lhsChar = lhs.charCodeAt(lhsI++);
			rhsChar = rhs.charCodeAt(rhsI++);
		}

		while (lhsChar === 0) {
			lhsChar = lhs.charCodeAt(lhsI++);
		}

		while (rhsChar === 0) {
			rhsChar = rhs.charCodeAt(rhsI++);
		}

		let firstDiff = 0;
		while (!Number.isNaN(lhsChar) && !Number.isNaN(rhsChar) && isAsciiDigit(lhsChar) && isAsciiDigit(rhsChar)) {
			const noDiff = +(firstDiff === 0);
			firstDiff = noDiff * (lhsChar - rhsChar) + (noDiff ^ 1) * firstDiff;
			lhsChar = lhs.charCodeAt(lhsI++);
			rhsChar = rhs.charCodeAt(rhsI++);
		}

		if (!Number.isNaN(lhsChar) && isAsciiDigit(lhsChar)) {
			return ORDERING_GT;
		}
		if (!Number.isNaN(rhsChar) && isAsciiDigit(rhsChar)) {
			return ORDERING_LT;
		}
		if (firstDiff !== 0) {
			return Math.max(Math.min(firstDiff, 1), -1);
		}
	}

	const lhsIsNaN = Number.isNaN(lhsChar);
	const rhsIsNaN = Number.isNaN(rhsChar);
	if (lhsIsNaN && rhsIsNaN) {
		return ORDERING_EQ;
	}
	if (lhsIsNaN && !rhsIsNaN) {
		return (+(rhsChar === TILDE_ASCII) << 1) - 1;
	}
	if (!lhsIsNaN && rhsIsNaN) {
		return (+(lhsChar !== TILDE_ASCII) << 1) - 1;
	}

	// this should be unreachable
	return ORDERING_GT;
}

/**
 * @param {string} string
 * @param {{ epoch: number; version: string; revision: string }} dest
 * */
export function parseVersion(string, dest) {
	let epoch = 0;
	let versionStartPos = string.indexOf(":");
	if (versionStartPos !== -1) {
		epoch = parseInt(string.substring(0, versionStartPos)) | 0;
	}
	++versionStartPos;

	const revisionStartPos = string.lastIndexOf("-");
	const hasRevision = revisionStartPos !== -1;

	dest.epoch = epoch;
	dest.version = hasRevision
		? string.substring(versionStartPos, revisionStartPos)
		: string.substring(versionStartPos);
	dest.revision = hasRevision ? string.substring(revisionStartPos + 1) : "";
}

/**
 * @param {number} lhsEpoch,
 * @param {string} lhsVersion,
 * @param {string} lhsRevision,
 * @param {number} rhsEpoch,
 * @param {string} rhsVersion,
 * @param {string} rhsRevision,
 * @returns {0 | 1 | -1}
 */
export function compareParsedDebianVersions(lhsEpoch, lhsVersion, lhsRevision, rhsEpoch, rhsVersion, rhsRevision) {
	if (lhsEpoch === rhsEpoch && lhsVersion === rhsVersion && lhsRevision === rhsRevision) {
		return ORDERING_EQ;
	}

	if (lhsEpoch > rhsEpoch) {
		return ORDERING_GT;
	}
	if (lhsEpoch < rhsEpoch) {
		return ORDERING_LT;
	}

	const versionOrdering = compareFragment(lhsVersion, rhsVersion);
	if (versionOrdering === ORDERING_EQ) {
		const lhsHasLength = +(lhsVersion.length + lhsRevision.length !== 0);
		const rhsHasLength = +(lhsVersion.length + lhsRevision.length !== 0);
		return lhsHasLength & rhsHasLength
			? compareFragment(lhsRevision, rhsRevision)
			: lhsHasLength * ORDERING_GT + rhsHasLength * ORDERING_LT;
	}

	return versionOrdering;
}

/**
 * @param {string} lhs
 * @param {string} rhs
 * @returns {0 | 1 | -1}
 */
export function compareDebianVersions(lhs, rhs) {
	if (lhs === rhs) {
		return ORDERING_EQ;
	}

	parseVersion(lhs, PARSE_VERSION_OBJ);
	const lhsEpoch = PARSE_VERSION_OBJ.epoch;
	const lhsVersion = PARSE_VERSION_OBJ.version;
	const lhsRevision = PARSE_VERSION_OBJ.revision;

	parseVersion(rhs, PARSE_VERSION_OBJ);
	const rhsEpoch = PARSE_VERSION_OBJ.epoch;
	const rhsVersion = PARSE_VERSION_OBJ.version;
	const rhsRevision = PARSE_VERSION_OBJ.revision;

	return compareParsedDebianVersions(lhsEpoch, lhsVersion, lhsRevision, rhsEpoch, rhsVersion, rhsRevision);
}
