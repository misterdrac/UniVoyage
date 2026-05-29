#!/usr/bin/env node
/**
 * Terminal splash — printed when frontend or backend starts locally.
 * Usage: node print.mjs frontend|backend
 *
 * ASCII art: scripts/terminal/ascii-art.txt
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";

const MIN_PANEL_WIDTH = 54;
const LABEL_WIDTH = 11;

const PROFILES = {
  frontend: {
    label: "FRONTEND",
    stack: "Vite + React",
    accent: CYAN,
    lines: [
      ["App", "http://localhost:5173"],
      ["API proxy", "http://127.0.0.1:8080/api  (via /api)"],
      ["Admin", "http://localhost:5173/admin"],
    ],
  },
  backend: {
    label: "BACKEND",
    stack: "Spring Boot · Docker Compose",
    accent: YELLOW,
    lines: [
      ["API", "http://127.0.0.1:8080"],
      ["Health", "http://127.0.0.1:8080/actuator/health"],
      ["Postgres", "127.0.0.1:5433  (default host port)"],
    ],
  },
};

function readAsciiArt() {
  const raw = readFileSync(join(__dirname, "ascii-art.txt"), "utf8");
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\t/g, "  ").replace(/\u00a0/g, " "))
    .filter((line) => !line.startsWith("#"))
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);
}

function computePanelWidth(profile) {
  const title = `${profile.label} · ${profile.stack}`;
  const rows = profile.lines.map(
    ([label, value]) => `${label.padEnd(LABEL_WIDTH)} ${value}`,
  );
  return Math.max(
    MIN_PANEL_WIDTH,
    title.length + 2,
    ...rows.map((line) => line.length + 2),
  );
}

function repeat(char, count) {
  return char.repeat(Math.max(0, count));
}

function visibleLength(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, "").length;
}

function printRule(margin, accent, width, left = "═", right = "═") {
  process.stdout.write(
    `${margin}${accent}${left}${repeat("═", width)}${right}${RESET}\n`,
  );
}

function printBorderRow(margin, accent, content, width) {
  const pad = Math.max(0, width - visibleLength(content) - 1);
  process.stdout.write(
    `${margin}${accent}║${RESET} ${content}${repeat(" ", pad)}${accent}║${RESET}\n`,
  );
}

function printInfoRow(margin, accent, label, value, width) {
  const plainLen = LABEL_WIDTH + 1 + value.length + 1;
  const pad = Math.max(0, width - plainLen);
  process.stdout.write(
    `${margin}${accent}║${RESET} ${BOLD}${label.padEnd(LABEL_WIDTH)}${RESET} ${GREEN}${value}${RESET}${repeat(" ", pad)}${accent}║${RESET}\n`,
  );
}

function printAsciiArt(lines) {
  if (lines.length === 0) return 0;

  const artWidth = Math.max(...lines.map((line) => line.length));
  const terminalWidth = process.stdout.columns ?? 0;

  if (terminalWidth > 0 && terminalWidth < artWidth + 2) {
    process.stdout.write(
      `${DIM}Tip: widen this terminal to at least ${artWidth + 2} columns (monospace font) so the logo does not wrap.${RESET}\n\n`,
    );
  }

  for (const line of lines) {
    // Keep leading spaces; only pad the right so every row is the same width.
    process.stdout.write(`${line.padEnd(artWidth, " ")}\n`);
  }

  process.stdout.write("\n");
  return artWidth;
}

function printSplash(service) {
  const profile = PROFILES[service];
  if (!profile) {
    console.error(`Unknown service "${service}". Use: frontend | backend`);
    process.exit(1);
  }

  const lines = readAsciiArt();
  const { accent, label, stack, lines: infoLines } = profile;
  const panelWidth = computePanelWidth(profile);

  process.stdout.write("\n");

  const artWidth = printAsciiArt(lines);
  const panelMargin = repeat(
    " ",
    Math.max(0, Math.floor((artWidth - panelWidth) / 2)),
  );

  printRule(panelMargin, accent, panelWidth, "╔", "╗");
  printBorderRow(
    panelMargin,
    accent,
    `${BOLD}${label}${RESET} ${DIM}· ${stack}${RESET}`,
    panelWidth,
  );
  printRule(panelMargin, accent, panelWidth, "╠", "╣");

  for (const [rowLabel, rowValue] of infoLines) {
    printInfoRow(panelMargin, accent, rowLabel, rowValue, panelWidth);
  }

  printRule(panelMargin, accent, panelWidth, "╚", "╝");
  process.stdout.write(
    `${panelMargin}${DIM}Spring Boot back-end first, then front-end.${RESET}\n\n`,
  );
}

const service = process.argv[2]?.toLowerCase();
printSplash(service);
