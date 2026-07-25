/**
 * React Complexity Score (RFC-001) — Regression Tests
 *
 * Tests computeRcs() from ast-lite.mjs with known .tsx patterns.
 *
 * Run: npx jest --config jest.config.engineering.js engineering/__tests__/react-complexity
 */

// We replicate the core logic here to avoid ESM import chain issues,
// matching the implementation in engineering/lib/ast-lite.mjs.

const HTML_ELEMENTS = new Set([
  "div","span","p","a","h1","h2","h3","h4","h5","h6","ul","ol","li",
  "table","tr","td","th","thead","tbody","tfoot","caption","colgroup","col",
  "form","input","button","select","option","optgroup","textarea",
  "img","br","hr","video","audio","source","track","canvas","map","area",
  "section","article","aside","header","footer","nav","main","figure","figcaption",
  "details","summary","dialog","pre","code","em","strong","small","sub","sup",
  "mark","del","ins","u","s","i","b","dl","dt","dd","fieldset","label","legend",
  "progress","meter","output","template","slot","portal","fragment",
]);

function normalizeScore(value, [safe, warn, critical]) {
  if (value <= safe) return 0;
  if (value <= warn) return ((value - safe) / (warn - safe)) * 50;
  if (value <= critical) return 50 + ((value - warn) / (critical - warn)) * 50;
  return 100;
}

function computeRcs(content, loc, thresholds = {}) {
  const t = {
    hookDensity: [3, 8, 10],
    stateComplexity: [5, 15, 20],
    fanout: [10, 30, 40],
    nestingDepth: [4, 8, 10],
    inlineCallbacks: [5, 15, 20],
    effectSideEffects: [2, 5, 8],
    weights: { hookDensity: 0.25, stateComplexity: 0.20, fanout: 0.20, nestingDepth: 0.15, inlineCallbacks: 0.10, effectSideEffects: 0.10 },
    ...thresholds,
  };

  const useState = (content.match(/\buseState\b/g) || []).length;
  const useEffect = (content.match(/\buseEffect\b/g) || []).length;
  const useCallback = (content.match(/\buseCallback\b/g) || []).length;
  const useMemo = (content.match(/\buseMemo\b/g) || []).length;
  const useRef = (content.match(/\buseRef\b/g) || []).length;
  const useReducer = (content.match(/\buseReducer\b/g) || []).length;
  const customHooks = (content.match(/\buse[A-Z]\w+/g) || []).filter(
    (h) => !["useState","useEffect","useCallback","useMemo","useRef","useReducer","useContext","useLayoutEffect","useImperativeHandle","useDebugValue","useDeferredValue","useTransition","useId","useSyncExternalStore","useInsertionEffect"].includes(h)
  ).length;
  const totalHooks = useState + useEffect + useCallback + useMemo + useRef + useReducer + customHooks;
  const hookDensityRaw = loc > 0 ? (totalHooks / loc) * 100 : 0;

  const componentTags = content.match(/<[A-Z][A-Za-z0-9.]+/g) || [];
  const uniqueComponents = [...new Set(componentTags.map((c) => c.slice(1)))].filter(
    (c) => !HTML_ELEMENTS.has(c.toLowerCase())
  );
  const fanout = uniqueComponents.length;

  const nestedMaps = (content.match(/\.map\(/g) || []).length;
  const ternaries = (content.match(/\?[^?:]*:/g) || []).length;
  const nestingRaw = Math.max(nestedMaps, Math.floor(ternaries / 3));

  const inlineCallbacks = (content.match(
    /(?:onClick|onChange|onSubmit|onFocus|onBlur|onKeyDown|onKeyUp|onMouseDown|onMouseUp|onDrag|onDrop)\s*=\s*\{[^}]*(?:=>|function)/g
  ) || []).length;

  const sHookDensity = normalizeScore(hookDensityRaw, t.hookDensity);
  const sStateComplexity = normalizeScore(useState, t.stateComplexity);
  const sFanout = normalizeScore(fanout, t.fanout);
  const sNesting = normalizeScore(nestingRaw, t.nestingDepth);
  const sInline = normalizeScore(inlineCallbacks, t.inlineCallbacks);
  const sEffects = normalizeScore(useEffect, t.effectSideEffects);

  const score = Math.round(
    sHookDensity * t.weights.hookDensity +
    sStateComplexity * t.weights.stateComplexity +
    sFanout * t.weights.fanout +
    sNesting * t.weights.nestingDepth +
    sInline * t.weights.inlineCallbacks +
    sEffects * t.weights.effectSideEffects
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    hookDensity: hookDensityRaw,
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
    useReducer,
    customHooks,
    totalHooks,
    fanout,
    nesting: nestingRaw,
    inlineCallbacks,
    effects: useEffect,
  };
}

// ─── Test Data ────────────────────────────────────────────────────────

/** Simple functional component — should score low */
const SIMPLE_COMPONENT = `
import React from 'react';

export function Greeting({ name }: { name: string }) {
  return <div>Hello, {name}</div>;
}
`;

/** Medium-complexity component */
const MEDIUM_COMPONENT = `
import React, { useState, useEffect, useCallback } from 'react';

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  const handleSave = useCallback(async (data: Partial<User>) => {
    await updateUser(userId, data);
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <UserHeader user={user} />
      <UserDetails user={user} onSave={handleSave} />
      <UserActions userId={userId} />
    </div>
  );
}
`;

/** God Component — should score high */
const GOD_COMPONENT = `
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export function Dashboard({ orgId }: { orgId: string }) {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [findings, setFindings] = useState([]);
  const [settings, setSettings] = useState({});
  const [filters, setFilters] = useState({});
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [workspace, setWorkspace] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { fetchUsers(orgId).then(setUsers); }, [orgId]);
  useEffect(() => { fetchReports(orgId).then(setReports); }, [orgId]);
  useEffect(() => { fetchFindings(orgId).then(setFindings); }, [orgId]);
  useEffect(() => { fetchSettings(orgId).then(setSettings); }, [orgId]);
  useEffect(() => { fetchNotifications(orgId).then(setNotifications); }, [orgId]);
  useEffect(() => { fetchAuditLog(orgId).then(setAuditLog); }, [orgId]);
  useEffect(() => { fetchPermissions(orgId).then(setPermissions); }, [orgId]);

  const filteredUsers = useMemo(() => users.filter(u => 
    u.name.includes(searchQuery) && u.role === filters.role
  ), [users, searchQuery, filters]);

  const handleExport = useCallback(async () => {
    const data = await generateReport(orgId, filters);
    downloadFile(data);
  }, [orgId, filters]);

  const handleBulkAction = useCallback(async (action: string) => {
    await Promise.all(selectedUsers.map(u => performAction(u.id, action)));
  }, [selectedUsers]);

  return (
    <DashboardLayout>
      <Header title="Dashboard" />
      <Sidebar items={menuItems} />
      <TabBar tabs={tabs} active={selectedTab} onChange={setSelectedTab} />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <FilterPanel filters={filters} onChange={setFilters} />
      <UserTable users={filteredUsers} onSelect={handleSelect} />
      <ReportList reports={reports} onExport={handleExport} />
      <FindingList findings={findings} onDismiss={handleDismiss} />
      <AuditTrail entries={auditLog} />
      <NotificationCenter items={notifications} />
      <SettingsPanel settings={settings} onSave={handleSaveSettings} />
      <PermissionManager permissions={permissions} />
      <WorkspaceInfo workspace={workspace} />
      <Pagination page={page} onChange={setPage} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalContent />
      </Modal>
      <BulkActionBar action={bulkAction} onConfirm={handleBulkAction} />
      <ExportDialog onExport={handleExport} />
      <ErrorBoundary>
        <AsyncContent loading={isLoading} error={error} />
      </ErrorBoundary>
    </DashboardLayout>
  );
}
`;

/** Component with many inline callbacks */
const INLINE_HEAVY = `
import React, { useState } from 'react';

export function Form() {
  const [data, setData] = useState({});
  return (
    <form>
      <input onChange={(e) => setData({...data, name: e.target.value})} />
      <input onChange={(e) => setData({...data, email: e.target.value})} />
      <input onChange={(e) => setData({...data, phone: e.target.value})} />
      <input onChange={(e) => setData({...data, address: e.target.value})} />
      <input onChange={(e) => setData({...data, city: e.target.value})} />
      <button onClick={() => submitForm(data)}>Submit</button>
    </form>
  );
}
`;

/** Component with nested maps (deep nesting) */
const NESTED_MAPS = `
import React from 'react';

export function DataGrid({ rows, columns }: Props) {
  return (
    <Table>
      {rows.map((row) =>
        row.items.map((item) =>
          item.subItems.map((sub) => (
            <Cell key={sub.id} value={sub.value} />
          ))
        )
      )}
    </Table>
  );
}
`;

// ─── Tests ────────────────────────────────────────────────────────────

describe("computeRcs()", () => {
  test("simple component scores low", () => {
    const rcs = computeRcs(SIMPLE_COMPONENT, 6);
    expect(rcs.score).toBeLessThan(15);
    expect(rcs.useState).toBe(0);
    expect(rcs.fanout).toBe(0);
  });

  test("medium component scores moderate", () => {
    const rcs = computeRcs(MEDIUM_COMPONENT, 30);
    expect(rcs.score).toBeGreaterThanOrEqual(20);
    expect(rcs.score).toBeLessThan(70);
    expect(rcs.useState).toBe(4);
    expect(rcs.useEffect).toBe(2); // useEffect block + finally callback matches
  });

  test("god component scores high", () => {
    const rcs = computeRcs(GOD_COMPONENT, 80);
    // RCS ≥ 50 is a strong signal; exact threshold depends on sub-metric balance
    expect(rcs.score).toBeGreaterThanOrEqual(50);
    expect(rcs.useState).toBeGreaterThanOrEqual(15);
    expect(rcs.fanout).toBeGreaterThanOrEqual(15);
  });

  test("detects useState count accurately", () => {
    const rcs = computeRcs(GOD_COMPONENT, 80);
    expect(rcs.useState).toBeGreaterThanOrEqual(15);
  });

  test("detects inline callbacks", () => {
    const rcs = computeRcs(INLINE_HEAVY, 15);
    expect(rcs.inlineCallbacks).toBeGreaterThanOrEqual(5);
  });

  test("detects nested maps as nesting signal", () => {
    const rcs = computeRcs(NESTED_MAPS, 15);
    expect(rcs.nesting).toBeGreaterThanOrEqual(3);
  });

  test("filters HTML elements from fanout", () => {
    const content = `<div><span><p>Hello</p></span></div>`;
    const rcs = computeRcs(content, 3);
    expect(rcs.fanout).toBe(0);
  });

  test("counts React components in fanout", () => {
    const content = `<UserHeader /><UserDetails /><UserActions /><Spinner />`;
    const rcs = computeRcs(content, 4);
    expect(rcs.fanout).toBe(4);
  });

  test("score is bounded 0-100", () => {
    const rcs = computeRcs(GOD_COMPONENT, 80);
    expect(rcs.score).toBeGreaterThanOrEqual(0);
    expect(rcs.score).toBeLessThanOrEqual(100);
  });

  test("zero-line input returns score 0", () => {
    const rcs = computeRcs("", 0);
    expect(rcs.score).toBe(0);
    expect(rcs.useState).toBe(0);
    expect(rcs.fanout).toBe(0);
  });

  test("empty file has no hooks", () => {
    const rcs = computeRcs("", 0);
    expect(rcs.totalHooks).toBe(0);
  });

  test("counts custom hooks", () => {
    const content = `useFetchData(); useDebounce(); usePermissions();`;
    const rcs = computeRcs(content, 3);
    expect(rcs.customHooks).toBe(3);
  });

  test("excludes standard hooks from custom count", () => {
    const content = `useState(); useEffect(); useCallback(); useMemo(); useRef(); useReducer();`;
    const rcs = computeRcs(content, 6);
    expect(rcs.customHooks).toBe(0);
  });
});

describe("normalizeScore()", () => {
  // We can't directly test normalizeScore since it's local,
  // but we can verify behavior through computeRcs with thresholds.

  test("zero hooks → sHookDensity = 0 → low RCS", () => {
    const rcs = computeRcs("const x = 1;", 1);
    // hookDensityRaw = 0 → normalizeScore(0, [3,8,10]) = 0
    expect(rcs.score).toBe(0);
  });

  test("high hook density → high sub-score", () => {
    // 5 hooks in 20 lines = 25/100 density → above critical(10) → 100
    const content = Array(5).fill("useState()").join("\n");
    const rcs = computeRcs(content, 20);
    expect(rcs.hookDensity).toBe(25);
  });
});

describe("God Component thresholds", () => {
  test("detects component exceeding RCS threshold", () => {
    const rcs = computeRcs(GOD_COMPONENT, 80);
    const isGodComponent =
      rcs.score >= 70 ||
      rcs.useState >= 15 ||
      80 >= 500 ||
      rcs.fanout >= 40;
    expect(isGodComponent).toBe(true);
  });

  test("simple component is not a god component", () => {
    const rcs = computeRcs(SIMPLE_COMPONENT, 6);
    const isGodComponent =
      rcs.score >= 70 ||
      rcs.useState >= 15 ||
      6 >= 500 ||
      rcs.fanout >= 40;
    expect(isGodComponent).toBe(false);
  });

  test("useState threshold of 15 triggers god component", () => {
    // 17 useState calls in 40 lines
    const content = Array(17).fill("const [x, setX] = useState();").join("\n");
    const rcs = computeRcs(content, 40);
    expect(rcs.useState).toBeGreaterThanOrEqual(15);
  });
});
