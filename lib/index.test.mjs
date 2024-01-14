/// <reference types="bun-types" />
import { expect, test } from "bun:test";
import { compareDebianVersions as cmp } from "./index.mjs";

test("compares versions properly", () => {
	// These tests are based off of https://github.com/tcolgate/godinstall/blob/master/debversion_test.go
	expect(cmp("1.0", "1.0")).toBe(0);
	expect(cmp("1.0", "0.9")).toBe(1);
	expect(cmp("1.0", "1.1")).toBe(-1);
	expect(cmp("1.1", "1.0")).toBe(1);
	expect(cmp("10.0", "1.0")).toBe(1);
	expect(cmp("1.0", "10.1")).toBe(-1);
	expect(cmp("1a", "1")).toBe(1);
	expect(cmp("1a", "1b")).toBe(-1);
	expect(cmp("1b.0", "1a.1")).toBe(1);
	expect(cmp("1a.0", "1b.1")).toBe(-1);
	expect(cmp("1.0~1", "1.0")).toBe(-1);
	expect(cmp("1:1.0~1", "1.0")).toBe(1);
	expect(cmp("1.0~1", "2:1.0")).toBe(-1);
	expect(cmp("1.0-1~1", "1.0")).toBe(1);
	expect(cmp("1.0-1~1", "1.0-1")).toBe(-1);
	expect(cmp("1.0-1", "1.0~1")).toBe(1);
	expect(cmp("2.3~pre1003.wheezy1", "2.3~pre1002.wheezy1")).toBe(1);
	expect(cmp("2.3~pre1003.wheezy1", "2.30~pre1002.wheezy1")).toBe(-1);
	expect(cmp("1.0-7+bbm+b9.g24102c6.wheezy1", "1.0-6+bbm-b6.g442cbf8.wheezy1")).toBe(-1);
});
