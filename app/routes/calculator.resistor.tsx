import {
  Button,
  Card,
  Flex,
  Group,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { SI_PREFIXES } from "~/utils/consts";

type Token =
  | { type: "number"; value: number }
  | { type: "operator"; value: "+" | "||" }
  | { type: "paren"; value: "(" | ")" };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Parentheses
    if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char });
      i++;
      continue;
    }

    // Operators: + or ||
    if (char === "+") {
      tokens.push({ type: "operator", value: "+" });
      i++;
      continue;
    }

    if (char === "|" && input[i + 1] === "|") {
      tokens.push({ type: "operator", value: "||" });
      i += 2;
      continue;
    }

    // Numbers with optional SI prefix
    if (/[\d.]/.test(char)) {
      let numStr = "";
      while (i < input.length && /[\d.]/.test(input[i])) {
        numStr += input[i];
        i++;
      }

      let value = parseFloat(numStr);

      // Check for SI prefix
      if (i < input.length) {
        const prefixChar = input[i];
        const prefix = SI_PREFIXES.find((p) => p.prefix === prefixChar);
        if (prefix) {
          value *= prefix.value;
          i++;
        }
      }

      tokens.push({ type: "number", value });
      continue;
    }

    // Unknown character, skip
    i++;
  }

  return tokens;
}

function parseExpression(tokens: Token[]): number {
  let index = 0;

  function parsePrimary(): number {
    const token = tokens[index];

    if (!token) {
      throw new Error("Unexpected end of expression");
    }

    if (token.type === "number") {
      index++;
      return token.value;
    }

    if (token.type === "paren" && token.value === "(") {
      index++;
      const value = parseParallel(); // Start with lowest precedence inside parens
      const nextToken = tokens[index];
      if (!nextToken || nextToken.type !== "paren" || nextToken.value !== ")") {
        throw new Error("Missing closing parenthesis");
      }
      index++;
      return value;
    }

    throw new Error(`Unexpected token: ${token.type}`);
  }

  function parseSeries(): number {
    let left = parseParallel();

    while (index < tokens.length) {
      const token = tokens[index];
      if (token.type === "operator" && token.value === "+") {
        index++;
        const right = parseParallel();
        left = left + right; // Series: R1 + R2
      } else {
        break;
      }
    }

    return left;
  }

  function parseParallel(): number {
    let left = parsePrimary();

    while (index < tokens.length) {
      const token = tokens[index];
      if (token.type === "operator" && token.value === "||") {
        index++;
        const right = parsePrimary();
        // Parallel: (R1 * R2) / (R1 + R2)
        if (left === 0 || right === 0) {
          throw new Error("Cannot calculate parallel resistance with zero value");
        }
        left = (left * right) / (left + right);
      } else {
        break;
      }
    }

    return left;
  }

  const result = parseSeries();

  if (index < tokens.length) {
    throw new Error("Unexpected token at end of expression");
  }

  return result;
}

function formatResistance(value: number): string {
  if (value === 0) return "0Ω";

  const absValue = Math.abs(value);

  // Find the prefix that puts the scaled value in range [1, 1000)
  let bestPrefix = SI_PREFIXES[4]; // Default to no prefix (value = 1)

  for (const prefix of SI_PREFIXES) {
    const scaled = absValue / prefix.value;
    // Prefer this prefix if it puts the value in [1, 1000) range
    if (scaled >= 1 && scaled < 1000) {
      bestPrefix = prefix;
      break;
    }
  }

  const scaledValue = value / bestPrefix.value;

  // Format with appropriate precision (max 3 significant figures)
  let formatted: string;
  const absScaled = Math.abs(scaledValue);
  if (absScaled >= 100) {
    formatted = scaledValue.toFixed(1);
  } else if (absScaled >= 10) {
    formatted = scaledValue.toFixed(2);
  } else if (absScaled >= 1) {
    formatted = scaledValue.toFixed(2);
  } else {
    formatted = scaledValue.toFixed(3);
  }

  // Remove trailing zeros and trailing decimal point
  formatted = formatted.replace(/\.?0+$/, "");

  return `${formatted}${bestPrefix.prefix}Ω`;
}

function calculate(expression: string): { result: number; formatted: string } {
  const tokens = tokenize(expression);
  if (tokens.length === 0) {
    throw new Error("Empty expression");
  }
  const result = parseExpression(tokens);
  return { result, formatted: formatResistance(result) };
}

export default function ResistorCalculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<{ value: number; formatted: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ expression: string; result: string }[]>([]);

  const handleCalculate = () => {
    if (!expression.trim()) {
      setError("Please enter an expression");
      setResult(null);
      return;
    }

    try {
      const { result: value, formatted } = calculate(expression);
      setResult({ value, formatted });
      setError(null);

      // Add to history
      if (!history.find((h) => h.expression === expression)) {
        setHistory((prev) => [{ expression, result: formatted }, ...prev].slice(0, 10));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid expression");
      setResult(null);
    }
  };

  const insertOperator = (op: string) => {
    setExpression((prev) => prev + op);
  };

  const clearExpression = () => {
    setExpression("");
    setResult(null);
    setError(null);
  };

  return (
    <Stack gap="md">
      <Text>
        Calculate the equivalent resistance of resistors in series and parallel.
        Use + for series connections and || for parallel connections.
        Supports SI prefixes: k (kilo), M (mega), m (milli), µ (micro), n (nano), p (pico).
      </Text>

      <Card withBorder p="md">
        <Stack gap="sm">
          <TextInput
            label="Expression"
            placeholder="e.g., (5k || 3k) + 10"
            value={expression}
            onChange={(e) => setExpression(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCalculate();
              }
            }}
            error={error}
            size="md"
          />

          <Group gap="xs">
            <Button variant="light" size="xs" onClick={() => insertOperator(" + ")}>
              + (Series)
            </Button>
            <Button variant="light" size="xs" onClick={() => insertOperator(" || ")}>
              || (Parallel)
            </Button>
            <Button variant="light" size="xs" onClick={() => insertOperator("(")}>
              (
            </Button>
            <Button variant="light" size="xs" onClick={() => insertOperator(")")}>
              )
            </Button>
            <Button variant="light" size="xs" onClick={() => insertOperator("k")}>
              k
            </Button>
            <Button variant="light" size="xs" onClick={() => insertOperator("M")}>
              M
            </Button>
          </Group>

          <Group justify="space-between">
            <Button onClick={handleCalculate}>Calculate</Button>
            <Button variant="subtle" onClick={clearExpression}>
              Clear
            </Button>
          </Group>

          {result && (
            <Card withBorder bg="var(--mantine-color-dark-7)" p="sm">
              <Text size="sm" c="dimmed">
                Result
              </Text>
              <Title order={3}>{result.formatted}</Title>
            </Card>
          )}
        </Stack>
      </Card>

      <Text size="sm" fw={500}>
        Examples:
      </Text>
      <Stack gap="xs">
        <Text size="sm" c="dimmed">
          • 5 + 3 = 8Ω (series)
        </Text>
        <Text size="sm" c="dimmed">
          • 5 || 5 = 2.5Ω (parallel)
        </Text>
        <Text size="sm" c="dimmed">
          • (5 || 5) + 10 = 12.5Ω (parallel then series)
        </Text>
        <Text size="sm" c="dimmed">
          • 10k || 10k = 5kΩ (two 10k resistors in parallel)
        </Text>
        <Text size="sm" c="dimmed">
          • (5k || 3k) + (10 || 10k) = 11.875kΩ
        </Text>
      </Stack>

      {history.length > 0 && (
        <>
          <Text size="sm" fw={500} mt="md">
            History
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Expression</Table.Th>
                <Table.Th>Result</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {history.map((item, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{item.expression}</Table.Td>
                  <Table.Td>{item.result}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </>
      )}
    </Stack>
  );
}
