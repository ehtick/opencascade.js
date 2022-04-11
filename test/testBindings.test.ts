import shell from "shelljs";
import { type OpenCascadeInstance } from "opencascade.js/dist/node";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bindingsTestImage = process.env.bindingsTestImage ?? "donalffons/opencascade.js";
const customBuildCmd = `cd customBuilds && docker run --rm -v $(pwd):/src ${bindingsTestImage}`;

it("can create custom build: testBindings", () => {
  expect(shell.exec(`${customBuildCmd} testBindings.yml`).code).toBe(0);
});

let oc: OpenCascadeInstance = undefined;

it("can initialize custom build: testBindings", async () => {
  const mainJs = await import(path.join(__dirname, "customBuilds", "customBuild.testBindings.js"));
  globalThis.__dirname = __dirname;
  globalThis.require = createRequire(import.meta.url);
  globalThis.FS = fs;
  oc = await mainJs.default({
    locateFile: f => f.endsWith(".wasm") ? path.join(__dirname, "customBuilds", "customBuild.testBindings.wasm") : f,
  });
});

it("correctly binds StaticMethods::StaticMethods", async () => {
  expect(() => {
    new oc.StaticMethods();
  }).toThrow();
  expect(() => {
    new oc.StaticMethods_1();
  }).toThrow();
});

it("correctly binds StaticMethods::intReturn", async () => {
  expect(oc.StaticMethods.intReturn.argCount).toBe(0);
  expect(oc.StaticMethods.intReturn()).toBe(123);
  expect(() => {
    oc.StaticMethods.intReturn("keks");
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intReturn(123);
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intReturn(undefined);
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intReturn(null);
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intReturn({});
  }).toThrow();
});

it("correctly binds StaticMethods::intArgument", async () => {
  expect(oc.StaticMethods.intArgument.argCount).toBe(1);
  expect(() => {
    oc.StaticMethods.intArgument(123);
  }).not.toThrow();
  expect(() => {
    oc.StaticMethods.intArgument("123");
  }).not.toThrow();
  expect(() => {
    oc.StaticMethods.intArgument(234);
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intArgument();
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intArgument("keks");
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intArgument(undefined);
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intArgument(null);
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intArgument({});
  }).toThrow();
});

it("correctly binds StaticMethods::intRefArgument", async () => {
  expect(oc.StaticMethods.intRefArgument.argCount).toBe(1);
  expect(() => {
    oc.StaticMethods.intRefArgument(123);
  }).not.toThrow();
  expect(() => {
    oc.StaticMethods.intRefArgument({ current: 123 });
  }).not.toThrow();
  expect(() => {
    oc.StaticMethods.intRefArgument("123");
  }).not.toThrow();
  expect(() => {
    oc.StaticMethods.intRefArgument({ current: "123" });
  }).not.toThrow();
  expect(() => {
    oc.StaticMethods.intRefArgument(234);
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intRefArgument({ current: 234 });
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intRefArgument();
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intRefArgument("keks");
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intRefArgument({ current: "keks" });
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intRefArgument(undefined);
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intRefArgument({ current: undefined });
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intRefArgument(null);
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intRefArgument({ current: null });
  }).toThrow();
  expect(() => {
    oc.StaticMethods.intRefArgument({});
  }).toThrow();

  const intRef = { current: 123 };
  expect(() => {
    oc.StaticMethods.intRefArgument(intRef);
  }).not.toThrow();
  expect(intRef.current).toBe(234);
});

it("correctly binds Instantiable1", async () => {
  expect(() => {
    new oc.Instantiable1();
  }).toThrow();
  expect(() => {
    new oc.Instantiable1(123);
  }).not.toThrow();
  const instance = new oc.Instantiable1(123);
  expect(() => {
    instance.getVal();
  }).toThrow();
  expect(() => {
    instance.getVal_1();
  }).not.toThrow();
  expect(instance.getVal_1()).toBe(123);
  expect(() => {
    instance.getVal_2(1);
  }).not.toThrow();
  expect(instance.getVal_2(1)).toBe(124);
  expect(() => {
    instance.getVal_3(1, 1.234);
  }).not.toThrow();
  expect(instance.getVal_3(1, 1.234)).toBeCloseTo(153.0159912109375);
});

it("correctly binds Instantiable2", async () => {
  expect(() => {
    new oc.Instantiable2();
  }).toThrow();
  expect(() => {
    new oc.Instantiable2_1();
    new oc.Instantiable2_2(123);
    new oc.Instantiable2_3(123, 1);
  }).not.toThrow();
  expect((new oc.Instantiable2_1()).getVal()).toBe(0);
  expect((new oc.Instantiable2_2(123)).getVal()).toBe(123);
  expect((new oc.Instantiable2_3(123, 1)).getVal()).toBe(124);
  const instance1 = new oc.Instantiable2_3(123, 1);
  const instance2 = new oc.Instantiable2_2(123);
  expect(instance1.addInstantiable2(instance2)).toBe(247);
});