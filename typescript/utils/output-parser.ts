// deno-lint-ignore-file no-explicit-any
import { scValToNative } from "stellar-sdk";

export const formatScVal = (scval: any, functionName: string): string => {
  if (!scval) {
    return "null";
  }

  switch (functionName) {
    case "void":
      return "void";

    case "bool":
      return getBoolValue(scval).toString();

    case "u32":
      return getU32Value(scval).toString();

    case "i32":
      return getI32Value(scval).toString();

    case "u64":
      return getU64Value(scval).toString();

    case "i64":
      return getI64Value(scval).toString();

    case "timepoint":
      return `timepoint(${getTimepointValue(scval)})`;

    case "duration":
      return `duration(${getDurationValue(scval)})`;

    case "u128":
      return getU128Value(scval).toString();

    case "i128":
      return getI128Value(scval).toString();

    case "u256":
      return getU256Value(scval).toString();

    case "i256":
      return getI256Value(scval).toString();

    case "bytes": {
      const bytes = getBytesValue(scval);
      return `bytes[${bytes.length}]: ${Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ")}`;
    }

    case "bytes_n": {
      const bytes = getBytesValue(scval);
      return `bytes[${bytes.length}]: ${Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ")}`;
    }

    case "string":
      return `"${getStringValue(scval)}"`;

    case "symbol":
      return getSymbolValue(scval);

    case "address":
      return getAddressValue(scval);

    case "vec_i128":
      return formatVecI128(scval);

    case "vec_address":
      return formatVecAddress(scval);

    case "map_sym_i128":
      return formatMapSymI128(scval);

    case "map_sym_vec_addr":
      return formatMapSymVecAddr(scval);

    case "any":
      return formatAny(scval);

    case "vec_any":
      return formatVecAny(scval);

    case "map_sym_any":
      return formatMapSymAny(scval);

    case "user":
      return formatUser(scval);

    case "choice":
      return formatChoice(scval);

    case "vec_user":
      return formatVecUser(scval);

    case "map_addr_user":
      return formatMapAddrUser(scval);

    case "option_u32":
      return formatOptionU32(scval);

    case "option_address":
      return formatOptionAddress(scval);

    case "option_user":
      return formatOptionUser(scval);

    case "nested_type":
      return formatNestedType(scval);

    case "flatten_nested_type":
      return formatFlattenNestedType(scval);

    case "fail":
      return "void (function executed successfully)";

    default:
      return `Unknown function: ${functionName}`;
  }
};

// Helper functions to extract values from XDR objects
function getBoolValue(scval: any): boolean {
  return scval._value ?? scval.b?.() ?? scval.value?.() ?? false;
}

function getU32Value(scval: any): number {
  return scval._value ?? scval.u32?.() ?? scval.value?.() ?? 0;
}

function getI32Value(scval: any): number {
  return scval._value ?? scval.i32?.() ?? scval.value?.() ?? 0;
}

function getU64Value(scval: any): bigint {
  return scval._value ?? scval.u64?.() ?? scval.value?.() ?? 0n;
}

function getI64Value(scval: any): bigint {
  return scval._value ?? scval.i64?.() ?? scval.value?.() ?? 0n;
}

function getU128Value(scval: any): bigint {
  return scval._value ?? scval.u128?.() ?? scval.value?.() ?? 0n;
}

function getI128Value(scval: any): bigint {
  return scval._value ?? scval.i128?.() ?? scval.value?.() ?? 0n;
}

function getU256Value(scval: any): string {
  return (scval._value ?? scval.u256?.() ?? scval.value?.() ?? "0").toString();
}

function getI256Value(scval: any): string {
  return (scval._value ?? scval.i256?.() ?? scval.value?.() ?? "0").toString();
}

function getTimepointValue(scval: any): string {
  return (
    scval._value ??
    scval.timepoint?.() ??
    scval.value?.() ??
    "0"
  ).toString();
}

function getDurationValue(scval: any): string {
  return (
    scval._value ??
    scval.duration?.() ??
    scval.value?.() ??
    "0"
  ).toString();
}

function getBytesValue(scval: any): Uint8Array {
  return scval._value ?? scval.bytes?.() ?? scval.value?.() ?? new Uint8Array();
}

function getStringValue(scval: any): string {
  return scval._value ?? scval.str?.() ?? scval.value?.() ?? "";
}

function getSymbolValue(scval: any): string {
  return scval._value ?? scval.sym?.() ?? scval.value?.() ?? "";
}

function getAddressValue(scval: any): string {
  return (
    scval._value ??
    scval.address?.() ??
    scval.value?.() ??
    ""
  ).toString();
}

function getVecValue(scval: any): any[] {
  return scval._value ?? scval.vec?.() ?? scval.value?.() ?? [];
}

function getMapValue(scval: any): any[] {
  return scval._value ?? scval.map?.() ?? scval.value?.() ?? [];
}

// Function-specific formatters
function formatVecI128(scval: any): string {
  const vec = getVecValue(scval);
  const items = vec.map((item) => {
    try {
      // Use scValToNative to properly convert the i128 values
      const nativeValue = scValToNative(item);
      return nativeValue.toString();
    } catch (_error) {
      // Fallback to manual parsing if scValToNative fails
      if (item._switch?.name === "scvI128") {
        return item._value?.toString() || "0";
      } else if (item.switch && typeof item.switch === "function") {
        const switchResult = item.switch();
        if (switchResult.name === "scvI128") {
          return (item.i128 ? item.i128() : item.value())?.toString() || "0";
        }
      }
      return getI128Value(item).toString();
    }
  });
  return `[${items.join(", ")}]`;
}

function formatVecAddress(scval: any): string {
  try {
    // Use scValToNative to properly convert the address vector
    const nativeVec = scValToNative(scval);
    return `[\n  ${nativeVec.join(",\n  ")}\n]`;
  } catch (_error) {
    // Fallback to manual parsing
    const vec = getVecValue(scval);
    const items = vec.map((item) => getAddressValue(item));
    return `[\n  ${items.join(",\n  ")}\n]`;
  }
}

function formatMapSymI128(scval: any): string {
  try {
    const nativeMap = scValToNative(scval);
    const items = Object.entries(nativeMap).map(
      ([key, val]) => `  ${key}: ${val}`
    );
    return `{\n${items.join(",\n")}\n}`;
  } catch (_error) {
    const map = getMapValue(scval);
    const items = map.map((entry) => {
      const key = getSymbolValue(
        entry._attributes?.key ?? entry.key?.() ?? entry.key
      );
      const val = getI128Value(
        entry._attributes?.val ?? entry.val?.() ?? entry.val
      );
      return `  ${key}: ${val}`;
    });
    return `{\n${items.join(",\n")}\n}`;
  }
}

function formatMapSymVecAddr(scval: any): string {
  const map = getMapValue(scval);
  const items = map.map((entry) => {
    const key = getSymbolValue(
      entry._attributes?.key ?? entry.key?.() ?? entry.key
    );
    const val = getVecValue(
      entry._attributes?.val ?? entry.val?.() ?? entry.val
    );
    const addresses = val.map((addr) => getAddressValue(addr));
    return `  ${key}: [${addresses.join(", ")}]`;
  });
  return `{\n${items.join(",\n")}\n}`;
}

function formatAny(scval: any): string {
  // For 'any' we just return the symbol value since that's what we send
  return getSymbolValue(scval);
}

function formatVecAny(scval: any): string {
  const vec = getVecValue(scval);
  const items = vec.map((item) => {
    if (
      item._switch?.name === "scvI128" ||
      item.switch?.().name === "scvI128"
    ) {
      return getI128Value(item);
    } else if (
      item._switch?.name === "scvSymbol" ||
      item.switch?.().name === "scvSymbol"
    ) {
      return getSymbolValue(item);
    }
    return "unknown";
  });
  return `[${items.join(", ")}]`;
}

function formatMapSymAny(scval: any): string {
  const map = getMapValue(scval);
  const items = map.map((entry) => {
    const key = getSymbolValue(
      entry._attributes?.key ?? entry.key?.() ?? entry.key
    );
    const val = entry._attributes?.val ?? entry.val?.() ?? entry.val;
    const valStr = getSymbolValue(val);
    return `  ${key}: ${valStr}`;
  });
  return `{\n${items.join(",\n")}\n}`;
}

function formatUser(scval: any): string {
  try {
    // Try using scValToNative first for the whole structure
    const nativeUser = scValToNative(scval);
    return `User {
  id: ${nativeUser.id},
  name: "${nativeUser.name}",
  tags: [${nativeUser.tags?.join(", ") ?? ""}]
}`;
  } catch (_error) {
    // Fallback to manual parsing
    const map = getMapValue(scval);
    const user: any = {};

    map.forEach((entry: any) => {
      const key = getSymbolValue(
        entry._attributes?.key ?? entry.key?.() ?? entry.key
      );
      const val = entry._attributes?.val ?? entry.val?.() ?? entry.val;

      if (key === "id") {
        user.id = getU32Value(val);
      } else if (key === "name") {
        user.name = getStringValue(val);
      } else if (key === "tags") {
        const tags = getVecValue(val);
        user.tags = tags.map((tag) => getSymbolValue(tag));
      }
    });

    return `User {
  id: ${user.id},
  name: "${user.name}",
  tags: [${user.tags?.join(", ") ?? ""}]
}`;
  }
}

function formatChoice(scval: any): string {
  try {
    const nativeChoice = scValToNative(scval);
    if (
      nativeChoice &&
      typeof nativeChoice === "object" &&
      "tag" in nativeChoice
    ) {
      return `Choice::${nativeChoice.tag}(${JSON.stringify(
        nativeChoice.values
      )})`;
    }
    return `Choice::${JSON.stringify(nativeChoice)}`;
  } catch (_error) {
    const vec = getVecValue(scval);
    if (vec.length >= 2) {
      const variant = getSymbolValue(vec[0]);
      const value = getU32Value(vec[1]);
      return `Choice::${variant}(${value})`;
    }
    return "Choice::Unknown";
  }
}

function formatVecUser(scval: any): string {
  try {
    const nativeVec = scValToNative(scval);
    const users = nativeVec.map(
      (user: any) =>
        `    User { id: ${user.id}, name: "${user.name}", tags: [${
          user.tags?.join(", ") ?? ""
        }] }`
    );
    return `[\n${users.join(",\n")}\n]`;
  } catch (_error) {
    const vec = getVecValue(scval);
    const users = vec.map((userScval) => {
      const map = getMapValue(userScval);
      const user: any = {};

      map.forEach((entry: any) => {
        const key = getSymbolValue(
          entry._attributes?.key ?? entry.key?.() ?? entry.key
        );
        const val = entry._attributes?.val ?? entry.val?.() ?? entry.val;

        if (key === "id") {
          user.id = getU32Value(val);
        } else if (key === "name") {
          user.name = getStringValue(val);
        } else if (key === "tags") {
          const tags = getVecValue(val);
          user.tags = tags.map((tag) => getSymbolValue(tag));
        }
      });

      return `    User { id: ${user.id}, name: "${user.name}", tags: [${
        user.tags?.join(", ") ?? ""
      }] }`;
    });

    return `[\n${users.join(",\n")}\n]`;
  }
}

function formatMapAddrUser(scval: any): string {
  const map = getMapValue(scval);
  const items = map.map((entry) => {
    const key = getAddressValue(
      entry._attributes?.key ?? entry.key?.() ?? entry.key
    );
    const val = entry._attributes?.val ?? entry.val?.() ?? entry.val;

    // Format the user value
    const userMap = getMapValue(val);
    const user: any = {};

    userMap.forEach((userEntry: any) => {
      const userKey = getSymbolValue(
        userEntry._attributes?.key ?? userEntry.key?.() ?? userEntry.key
      );
      const userVal =
        userEntry._attributes?.val ?? userEntry.val?.() ?? userEntry.val;

      if (userKey === "id") {
        user.id = getU32Value(userVal);
      } else if (userKey === "name") {
        user.name = getStringValue(userVal);
      } else if (userKey === "tags") {
        const tags = getVecValue(userVal);
        user.tags = tags.map((tag) => getSymbolValue(tag));
      }
    });

    return `  ${key}: User { id: ${user.id}, name: "${user.name}", tags: [${
      user.tags?.join(", ") ?? ""
    }] }`;
  });

  return `{\n${items.join(",\n")}\n}`;
}

function formatOptionU32(scval: any): string {
  if (
    scval._switch?.name === "scvVoid" ||
    scval.switch?.().name === "scvVoid"
  ) {
    return "None";
  }
  return `Some(${getU32Value(scval)})`;
}

function formatOptionAddress(scval: any): string {
  if (
    scval._switch?.name === "scvVoid" ||
    scval.switch?.().name === "scvVoid"
  ) {
    return "None";
  }
  return `Some(${getAddressValue(scval)})`;
}

function formatOptionUser(scval: any): string {
  if (
    scval._switch?.name === "scvVoid" ||
    scval.switch?.().name === "scvVoid"
  ) {
    return "None";
  }
  return `Some(${formatUser(scval)})`;
}

function formatNestedType(scval: any): string {
  try {
    // Try using scValToNative first
    const nativeNested = scValToNative(scval);
    const nestedStr =
      nativeNested.nested?.length > 0
        ? `[\n    ${nativeNested.nested
            .map((item: any) => JSON.stringify(item))
            .join(",\n    ")}\n  ]`
        : "[]";

    return `NestedType {
  depth: ${nativeNested.depth},
  width: ${nativeNested.width},
  nested: ${nestedStr}
}`;
  } catch (_error) {
    // Fallback to manual parsing
    const map = getMapValue(scval);
    const nested: any = {};

    map.forEach((entry: any) => {
      const key = getSymbolValue(
        entry._attributes?.key ?? entry.key?.() ?? entry.key
      );
      const val = entry._attributes?.val ?? entry.val?.() ?? entry.val;

      if (key === "depth") {
        nested.depth = getU32Value(val);
      } else if (key === "width") {
        nested.width = getU32Value(val);
      } else if (key === "nested") {
        const nestedVec = getVecValue(val);
        nested.nested = nestedVec.map((item) => formatNestedType(item));
      }
    });

    const nestedStr =
      nested.nested?.length > 0
        ? `[\n    ${nested.nested.join(",\n    ")}\n  ]`
        : "[]";

    return `NestedType {
  depth: ${nested.depth},
  width: ${nested.width},
  nested: ${nestedStr}
}`;
  }
}

function formatFlattenNestedType(scval: any): string {
  const vec = getVecValue(scval);
  const items = vec.map((item) => {
    const formatted = formatNestedType(item);
    return `  ${formatted.replace(/\n/g, "\n  ")}`;
  });

  return `[\n${items.join(",\n")}\n]`;
}
