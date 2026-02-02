import {
  Button,
  Card,
  Combobox,
  Flex,
  Group,
  InputWrapper,
  NumberInput,
  Text,
  useCombobox,
} from "@mantine/core";
import { getHotkeyHandler } from "@mantine/hooks";
import { useMemo, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { BASE_INDEX, SI_PREFIXES } from "~/utils/consts";

function formatValue(value: number): string {
  if (value === 0) return "0";
  // Format without scientific notation
  let str = value.toFixed(10);
  // Remove trailing zeros
  str = str.replace(/\.?0+$/, "");
  return str;
}

interface PrefixInputProps {
  label: string;
  value: number | string;
  onChange?: (value: number | string) => void;
  prefix: (typeof SI_PREFIXES)[number];
  onPrefixChange: (prefix: (typeof SI_PREFIXES)[number]) => void;
  readOnly?: boolean;
  onCalculate?: () => void;
}

function PrefixInput({
  label,
  value,
  onChange,
  prefix,
  onPrefixChange,
  readOnly = false,
  onCalculate,
}: PrefixInputProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  return (
    <InputWrapper label={label}>
      <NumberInput
        value={value || ""}
        onChange={onChange}
        readOnly={readOnly}
        styles={{
          section: {
            width: combobox.dropdownOpened ? 100 : 40,
          },
        }}
        onKeyDown={getHotkeyHandler(
          readOnly
            ? [
                ["k", () => onPrefixChange(SI_PREFIXES[3])],
                ["M", () => onPrefixChange(SI_PREFIXES[2])],
                ["G", () => onPrefixChange(SI_PREFIXES[1])],
                ["T", () => onPrefixChange(SI_PREFIXES[0])],
                ["space", () => onPrefixChange(SI_PREFIXES[BASE_INDEX])],
                ["m", () => onPrefixChange(SI_PREFIXES[5])],
                ["u", () => onPrefixChange(SI_PREFIXES[6])],
                ["n", () => onPrefixChange(SI_PREFIXES[7])],
                ["p", () => onPrefixChange(SI_PREFIXES[8])],
              ]
            : [
                ["k", () => onPrefixChange(SI_PREFIXES[3])],
                ["M", () => onPrefixChange(SI_PREFIXES[2])],
                ["G", () => onPrefixChange(SI_PREFIXES[1])],
                ["T", () => onPrefixChange(SI_PREFIXES[0])],
                ["space", () => onPrefixChange(SI_PREFIXES[BASE_INDEX])],
                ["m", () => onPrefixChange(SI_PREFIXES[5])],
                ["u", () => onPrefixChange(SI_PREFIXES[6])],
                ["n", () => onPrefixChange(SI_PREFIXES[7])],
                ["p", () => onPrefixChange(SI_PREFIXES[8])],
                ["enter", () => onCalculate?.()],
                ["escape", () => onChange?.("")],
              ]
        )}
        rightSection={
          <Combobox
            store={combobox}
            onOptionSubmit={(option) => {
              const newPrefix = SI_PREFIXES.find((p) => p.prefix === option) ?? prefix;
              onPrefixChange(newPrefix);
              // If value exists, adjust it to maintain the same actual value
              if (!readOnly && value !== "" && onChange) {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                  const actualValue = numValue * prefix.value;
                  const newValue = actualValue / newPrefix.value;
                  onChange(formatValue(newValue));
                }
              }
            }}
          >
            <Combobox.Target>
              <Text
                w="100%"
                onClick={() => combobox.toggleDropdown()}
                ta="right"
                style={{
                  position: "relative",
                  left: "-10px",
                  cursor: "pointer",
                  color: "var(--mantine-color-dimmed)",
                }}
              >
                {prefix.prefix || "—"}
              </Text>
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Options>
                {SI_PREFIXES.map((p) => (
                  <Combobox.Option
                    p={1}
                    value={p.prefix}
                    key={p.prefix}
                    style={{
                      textAlign: "center",
                      backgroundColor:
                        p.prefix === prefix.prefix
                          ? "var(--mantine-color-gray-light)"
                          : "transparent",
                    }}
                  >
                    {p.prefix || "base"}{" "}
                    {p.value !== 1 ? (
                      <>
                        (10<sup>{Math.log10(p.value)}</sup>)
                      </>
                    ) : null}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        }
      />
    </InputWrapper>
  );
}

export default function UnitConverter() {
  const [inputValue, setInputValue] = useState<number | string>("1");
  const [inputPrefix, setInputPrefix] = useState<(typeof SI_PREFIXES)[number]>(
    SI_PREFIXES[BASE_INDEX]
  );
  const [outputPrefix, setOutputPrefix] = useState<(typeof SI_PREFIXES)[number]>(
    SI_PREFIXES[3]
  );

  const result = useMemo(() => {
    const num = Number(inputValue);
    if (isNaN(num) || inputValue === "") return null;
    const baseValue = num * inputPrefix.value;
    return baseValue / outputPrefix.value;
  }, [inputValue, inputPrefix, outputPrefix]);

  const handleSwap = () => {
    // Swap prefixes
    setInputPrefix(outputPrefix);
    setOutputPrefix(inputPrefix);
    // Adjust the input value to match the new prefix
    if (result !== null) {
      setInputValue(formatValue(result));
    }
  };

  return (
    <Flex direction="column" gap="md">
      <Text>
        Convert between SI prefixes. Use hotkeys while focused on the input field:
        T, G, M, k, space, m, u, n, p
      </Text>

      <Card withBorder p="md">
        <Flex direction="column" gap="md">
          {/* Main conversion row */}
          <Flex gap="md" align="flex-end" justify="center">
            <PrefixInput
              label="From"
              value={inputValue}
              onChange={setInputValue}
              prefix={inputPrefix}
              onPrefixChange={setInputPrefix}
            />

            <Text size="xl" c="dimmed" style={{ marginBottom: "8px" }}>
              →
            </Text>

            <PrefixInput
              label="To"
              value={result !== null ? formatValue(result) : ""}
              prefix={outputPrefix}
              onPrefixChange={setOutputPrefix}
              readOnly
            />
          </Flex>

          {/* Action buttons */}
          <Group justify="center" gap="sm">
            <Button
              variant="light"
              size="sm"
              leftSection={<ArrowRightLeft size={16} />}
              onClick={handleSwap}
            >
              Swap
            </Button>
          </Group>
        </Flex>
      </Card>
    </Flex>
  );
}
